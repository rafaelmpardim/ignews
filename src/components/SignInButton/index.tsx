import { FaGithub } from 'react-icons/fa'
import { FiX } from 'react-icons/fi'

import { useSession, signIn, signOut } from 'next-auth/react'

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
        Entrar com Github
			</button>
		)
	}
}