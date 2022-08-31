import { FaGithub } from 'react-icons/fa/index'
import { FiX } from 'react-icons/fi/index'

import { useSession, signIn, signOut } from '../../../node_modules/next-auth/react'

import styles from './styles.module.scss'

export function SignInButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <button
        className={styles.sigInButton}
        type="button"
        onClick={() => signOut()}
      >
        <FaGithub color="#04d361"/>
        {session.user.name}
        <FiX color="#737380" className={styles.closeIcon}/>
      </button>
    )
  } else {
    return (
      <button 
        className={styles.sigInButton}
        type="button"
        onClick={() => signIn()}
      >
        <FaGithub color="#eba417"/>
        Sign in with Github
      </button>
    )
  }
}