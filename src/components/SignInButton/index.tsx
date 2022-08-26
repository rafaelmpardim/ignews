import { FaGithub } from '../../../node_modules/react-icons/fa/index'
import { FiX } from '../../../node_modules/react-icons/fi/index'

import { signIn, signOut, useSession } from '../../../node_modules/next-auth/react/index'

import styles from './styles.module.scss'

export function SignInButton() {
  const { data: session } = useSession()

  return session ? (
    <button 
      className={styles.sigInButton}
      type="button"
      onClick={() => signOut()}
    >
      <FaGithub color="#04d361"/>
      {session.session.user.name}
      <FiX color="#737380" className={styles.closeIcon}/>
    </button>
  ) : (
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