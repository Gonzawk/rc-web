export default function BrandLogo({compact=false,className=''}){
  return <span className={`shop-brand-logo ${compact?'compact':''} ${className}`.trim()}>
    <img src="/rc-logo-transparent.png" alt="RC Repuestos y Accesorios" />
  </span>
}
