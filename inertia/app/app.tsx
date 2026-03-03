/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css';
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { DynamicFavicon } from '../components/DynamicFavicon'
import { DynamicTheme } from '../components/DynamicTheme'

const appName = import.meta.env.VITE_APP_NAME || 'Câmara de Sumé'

createInertiaApp({
  progress: { color: '#d4a017' },

  title: (title) => `${title} - ${appName}`,

  resolve: (name) => {
    return resolvePageComponent(
      `../pages/${name}.tsx`,
      import.meta.glob('../pages/**/*.tsx'),
    )
  },

  setup({ el, App, props }) {
    createRoot(el).render(<><DynamicFavicon /><DynamicTheme /><App {...props} /></>)
  },
});
