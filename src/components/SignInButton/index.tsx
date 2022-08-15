import { FaGithub } from 'react-icons/fa'
import { FiX } from 'react-icons/fi'

import styles from './styles.module.scss'

export function SignInButton() {
  const isUserLoggedIn = true

  return isUserLoggedIn ? (
    <button 
      className={styles.sigInButton}
      type="button"
    >
      <FaGithub color="#04d361"/>
      Rafael Pardim
      <FiX color="#737380" className={styles.closeIcon}/>
    </button>
  ) : (
    <button 
      className={styles.sigInButton}
      type="button"
    >
      <FaGithub color="#eba417"/>
      Sign in with Github
    </button>
  )
}