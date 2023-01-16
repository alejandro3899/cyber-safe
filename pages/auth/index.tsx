import { GetServerSideProps } from 'next'

export default function Auth() {
  return null
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    redirect: {
      permanent: false,
      destination: '/auth/login',
    },
  }
}
