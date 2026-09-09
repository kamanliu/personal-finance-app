export function formatCurrency (value: number){
 
    const formattedCurrency =  value.toLocaleString('default', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 
return( `$${formattedCurrency}` )

}