import { ChakraProvider } from "@chakra-ui/react";
import { ToastProvider, useToasts } from "react-toast-notifications";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </ChakraProvider>
  );
}

export default MyApp;
