// Vista previa comercial; el servidor valida y recalcula todos los importes.
export function priceForQuantity(product, variant, quantity) {
  const list = Number(variant?.listPrice || 0)
  const offer = Boolean(product?.offerActive && variant?.offerActive && Number(variant?.offerPrice) > 0 && Number(variant.offerPrice) < list)
  const wholesale = Boolean(variant?.wholesaleEnabled && Number(variant?.wholesalePrice) > 0 && Number(variant.wholesalePrice) < list && Number.isInteger(Number(variant?.wholesaleMinQuantity)) && Number(variant.wholesaleMinQuantity) >= 2 && Number(quantity) >= Number(variant.wholesaleMinQuantity))
  const offerPrice = offer ? Number(variant.offerPrice) : list
  const wholesaleWins = wholesale && (!offer || Number(variant.wholesalePrice) < offerPrice)
  const price = wholesaleWins ? Number(variant.wholesalePrice) : offerPrice
  return {price, offer, wholesale, wholesaleWins, promotional: offer || wholesale, discountEligible: !offer && !wholesaleWins}
}

// Etiqueta informativa. No aplica precios sin alcanzar la cantidad mínima.
export function wholesaleSummary(product) {
  const variants=(product?.variants||[]).filter(v=>v.active!==false && v.available!==false && v.wholesaleEnabled && Number(v.wholesalePrice)>0 && Number.isInteger(Number(v.wholesaleMinQuantity)) && Number(v.wholesaleMinQuantity)>=2 && Number(v.wholesalePrice)<Number(v.listPrice||v.price||0));
  if (!variants.length) return null;
  const sorted=[...variants].sort((a,b)=>Number(a.wholesalePrice)-Number(b.wholesalePrice));
  const selected=sorted[0];
  return {price:Number(selected.wholesalePrice),minQuantity:Number(selected.wholesaleMinQuantity),multiple:variants.length>1};
}
