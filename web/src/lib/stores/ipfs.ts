export const ssr = true;
import { create } from 'ipfs-http-client';
import { writable } from 'svelte/store';

export const ipfs = writable<any>();

export const start = async () => {

  const auth =
  'Basic MkNDMHd0Tmg5NTFZQ2l1ZUdZZURRRkRLMjhSOmUwNTFkOWY1NzQ3ODhlMTg4NGQ1N2EyZGVjZjVmZTNi';

  ipfs.set(create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
  }));
}