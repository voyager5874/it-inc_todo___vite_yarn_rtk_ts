import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
// https://vitejs.dev/config/
// @ts-ignore
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [react(), tsconfigPaths()],
  base: '/it-inc_todo___vite_yarn_rtk_ts/',
});
