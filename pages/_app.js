import '../styles/globals.css'
import { AppProps } from 'next/app'

function MyApp({ Component, pageProps }) { // Corrected syntax for destructuring props
  return <Component {...pageProps} />
}

export default MyApp