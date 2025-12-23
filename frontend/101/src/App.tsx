import { Provider } from "./components/ui/provider"

function App({ Component, pageProps }: Readonly<{ Component: any; pageProps: any }>) {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  )
}

export default App