export default function Layout(props) {

  const { children } = props

  const header = (
    <header>
      <h1 className="text-gradient">The liftlog</h1>
      <p><strong>The 30 Simple Workouts Program</strong></p>
    </header>
  )

  const footer = (
    <footer>
      <p>By <a href="https://www.linkedin.com/in/andrei-drozzhin/" target="_blank">Andrei Drozzhin</a><br/>Styled with <a href="https://fantacss.smoljames.com/" target="_blank">FantaCSS</a></p>
    </footer>
  )

  //https://www.YOUR_USERNAME.netlify.app

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  )
}
