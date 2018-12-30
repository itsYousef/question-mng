import { ApolloClient } from 'apollo-client';
import { createUploadLink } from 'apollo-upload-file';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context'
import { concat } from 'apollo-link';
import { onError } from "apollo-link-error";
import { AsyncStorage } from 'react-native';

const SERVER_LINK = new createUploadLink({ uri: 'http://moshaver7ostad.ir/graphql', credentials: 'include' });
// const SERVER_LINK = new createUploadLink({ uri: 'http://23.227.201.71:8400/graphql', credentials: 'include' });

const ERROR_LINK = onError(({
    graphqlErrors,
    networkError
}) => {
    if (graphqlErrors) {
        return 1;
    }
    if (networkError) {
        return 2;
    }
})

// const authLink = setContext( async (_, { headers }) => {
//   // let token = await AsyncStorage.getItem('token');
//   return {
//     headers: {
//       ...headers,
//       // authorization: token ? `JWT ${token}` : ''
//     }
//   }
// })

const LINK = ERROR_LINK.concat(SERVER_LINK);

const client = new ApolloClient({
  link: LINK,
  cache: new InMemoryCache(),
  defaultOptions: {
  watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'none',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'none',
    },
    mutate: {
      errorPolicy: 'none'
    }
  },
})

export default client;
