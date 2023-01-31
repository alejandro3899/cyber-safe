import AddIcon from '@mui/icons-material/AddOutlined'
import { Button } from '@mui/material'
import { GridColumns } from '@mui/x-data-grid'
import { GetServerSideProps } from 'next'
import { useMemo } from 'react'
import { DataGridActions, DataGridViewer, InferNodeType } from '../../../../../components/common/DataGridViewer'
import { SearchBar } from '../../../../../components/common/SearchBar'
import { UserEmail } from '../../../../../components/common/UserEmail'
import { withDashboardLayout } from '../../../../../components/dashboard/Layout'
import { ParentActions } from '../../../../../components/data/ParentActions'
import { InviteParentForm } from '../../../../../components/form/InviteParentForm'
import {
  namedOperations,
  ParentRole,
  ParentsQuery,
  useInviteParentMutation,
  useMemberQuery,
  useParentsQuery,
} from '../../../../../types/graphql'
import { useAlert } from '../../../../../utils/context/alert'

const getColumns: (childId: string) => GridColumns<InferNodeType<ParentsQuery['parents']>> = (childId) => [
  {
    width: 250,
    field: 'name',
    headerName: 'Name',
  },
  {
    width: 300,
    field: 'email',
    headerName: 'E-mail',
    valueGetter(params) {
      return params.row
    },
    renderCell(params) {
      return <UserEmail {...params.value} />
    },
  },
  {
    width: 200,
    field: 'relation',
    sortable: false,
    headerName: 'Relation',
    valueGetter(params) {
      const role = params.row.roles.find((e) => e.role === 'PARENT') as ParentRole | undefined
      return role?.relation
    },
  },
  {
    width: 200,
    field: 'createdAt',
    headerName: 'Joined',
    valueFormatter(params) {
      return new Date(params.value).toLocaleString()
    },
  },
  {
    width: 200,
    field: 'actions',
    type: 'actions',
    renderCell(params) {
      return <ParentActions parentId={params.row.id} childId={childId} />
    },
  },
]

type Props = {
  memberId: string
}

function Member({ memberId }: Props) {
  const { pushAlert } = useAlert()

  const { data } = useMemberQuery({
    variables: { id: memberId },
  })
  const query = useParentsQuery({
    variables: { childId: memberId },
  })

  const [inviteParent] = useInviteParentMutation({
    refetchQueries: [namedOperations.Query.parents],
  })

  const columns = useMemo(() => getColumns(memberId), [memberId])

  return (
    <DataGridViewer
      query={query}
      columns={columns}
      data={query.data?.parents}
      back="/dashboard/admin/members"
      initialSortModel={{ field: 'createdAt', sort: 'desc' }}
      title={data ? `Parents of "${data.member.name}"` : 'Parents'}
      actions={
        <DataGridActions>
          <Button
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => {
              pushAlert({
                type: 'custom',
                title: 'Invite Parent',
                content: InviteParentForm,
                message: 'Enter the information below',
                result: (variables) => {
                  inviteParent({ variables: { ...variables, childId: memberId } })
                },
              })
            }}
          >
            Invite Parent
          </Button>
          <SearchBar onSearch={(search) => query.refetch({ search })} />
        </DataGridActions>
      }
    />
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const memberId = ctx.params!.memberId as string
  return { props: { memberId } }
}

export default withDashboardLayout(Member, {
  title: 'Member',
})
