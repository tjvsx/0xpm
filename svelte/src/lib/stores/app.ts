import { isAddress } from '$lib/actions/utils';
import { get, writable, derived } from 'svelte/store';

/* filetree store */
export const tree = writable([]);

/* tabs store */
export const tabs = writable([]);

export const margins = derived(tabs, $tabs => {
  return indent($tabs);
}, []);

function indent(tabs) {
  let indents = [];
  for (let i = 0; i < tabs.length; i++) {
    indents[i] =  2 * i;
  }
  return indents
}

export function generateTab(file, name) {
  tabs.update(tabs => {
  if (isAddress(name)) {
    file.owner = name;
  }
  
  if (!tabs.includes(file)) {
    tabs.push(file)
    tabs=tabs
    return tabs
  } else {
    navigate(file)
    return tabs
  }}) 
}

export function remove(tab) {
  tabs.update(tabs => {
    tabs = tabs.filter(i => i != tab)
    return tabs
  })
}

export function navigate(tab) {
  tabs.update(tabs => {
    tabs.push(tabs.splice(tabs.indexOf(tab), 1)[0])
    tabs=tabs
    return tabs
  })
}

/* cart store */
export const cart = writable();

export function addPkg(tab) {
  tab.action = 'install'
  cart.set(tab)
}

export function updatePkg(tab) {
  tab.action = 'update'
  cart.set(tab);
}

export function empty() {
  cart.set(undefined);
}

export function findPkg(upgrade) {
  let accounts = get(tree);
  for (let account of accounts) {
    if (account.name == upgrade.account) {
      for (let file of account.files) {
        if (file.name == upgrade.repo) {
          file.owner = account.name;
          file.installed = upgrade.package;
          return file;
        }
      }
    }
  }
}

export function generateTabFromUpgrade(upgrade) {
  let pkg = findPkg(upgrade);
  if (pkg && pkg.files.at(-1) != pkg.installed) {
    // add pkg to cart
    updatePkg(pkg);
  }
  generateTab(pkg, '');
}