export function formatDate (date: string){
 const formattedDate = new Date(date || 0)
    const month =  formattedDate.toLocaleDateString('default', { month: 'long' });
    const day = formattedDate.toLocaleDateString('default', { day: 'numeric' }); 
    const weekday = formattedDate.toLocaleDateString('default', { weekday: 'short' }); 

return( `${month} ${day}, ${weekday}`)

}