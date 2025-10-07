/* Build the menu and content from the CATALOG constant */
const menu = document.getElementById('menu');
const content = document.getElementById('content');
const searchBox = document.getElementById('searchBox');
document.getElementById('year').textContent = new Date().getFullYear();

function el(tag, attrs = {}, ...children){
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.substring(2), v);
    else node.setAttribute(k, v);
  });
  for (const child of children){
    if (typeof child === 'string') node.appendChild(document.createTextNode(child));
    else if (child) node.appendChild(child);
  }
  return node;
}

function buildMenu(data){
  menu.innerHTML = '';
  Object.entries(data).forEach(([category, products]) => {
    const details = el('details', {});
    const summary = el('summary', {}, el('span', {}, category), el('span',{class:'badge'}, String(Object.keys(products).length)));
    details.appendChild(summary);

    const list = el('div', {class:'product-list'});
    Object.entries(products).forEach(([productName, skus]) => {
      const btn = el('button', { 'aria-label': `Open ${productName}`, onclick: () => showProduct(category, productName, skus)},
        el('span', {}, productName)
      );
      const right = skus && skus.length ? el('span', {class:'badge'}, skus.length + ' SKU' + (skus.length>1?'s':'')) : el('span', {class:'empty'}, '—');
      list.appendChild(el('div',{class:'product'}, btn, right));
    });
    details.appendChild(list);
    menu.appendChild(details);
  });
}

function showProduct(category, product, skus){
  content.innerHTML = '';
  // Breadcrumbs
  content.appendChild(el('div',{class:'breadcrumbs'}, 'Category: ', el('span',{}, category), '  •  Product: ', el('span',{}, product)));
  content.appendChild(el('h1',{}, product));

  if(!skus || !skus.length){
    content.appendChild(el('p',{}, 'No sub content listed for this product in your image.'));
    return;
  }

  const grid = el('div', {class:'grid'});
  skus.forEach((sku, i) => {
    grid.appendChild(
      el('div',{class:'card'},
        el('div',{class:'sku'}, sku),
        el('div',{class:'meta'}, 'From "', product, '" in ', category),
        el('span',{class:'pill'}, 'Sub item')
      )
    )
  });
  content.appendChild(grid);
  // Move focus to content for accessibility
  content.focus();
}

function filterMenu(term){
  const t = term.trim().toLowerCase();
  if(!t){
    buildMenu(CATALOG);
    return;
  }
  // Filter categories/products based on term (matches product or SKU)
  const filtered = {};
  for(const [cat, products] of Object.entries(CATALOG)){
    const pruned = {};
    for(const [product, skus] of Object.entries(products)){
      const productMatches = product.toLowerCase().includes(t) || cat.toLowerCase().includes(t);
      const skuMatches = (skus||[]).some(s => String(s).toLowerCase().includes(t));
      if(productMatches || skuMatches){
        pruned[product] = skus;
      }
    }
    if(Object.keys(pruned).length) filtered[cat] = pruned;
  }
  buildMenu(filtered);
  // Expand all sections when filtered
  menu.querySelectorAll('details').forEach(d => d.open = true);
}

buildMenu(CATALOG);

searchBox.addEventListener('input', (e)=>filterMenu(e.target.value));
