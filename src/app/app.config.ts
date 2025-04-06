import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { inject } from '@angular/core';

export function createApollo() {
  const httpLink = inject(HttpLink); // Inject HttpLink dependency
  const http = httpLink.create({ uri: 'https://assignment1-zjie.onrender.com/graphql'});
  //https://backend-sbob.onrender.com/graphql

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : ''
      }
    };
  });

  return {
    link: authLink.concat(http),
    cache: new InMemoryCache()
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([])),
    provideApollo(createApollo) // Pass the parameterless createApollo
  ]
};

