import styles from './styles.module.scss'

export function Footer() {
	return (
		<header className={styles.footerContainer}>
			<div className={styles.footerContent}>
				<span>
          O processo de pagamento da sua inscrição é totalmente confiável e realizado pela Stripe. <br/>
          Não temos acesso aos seus dados.
				</span>
			</div>
		</header>
	)
}