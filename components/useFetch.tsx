
const useFetch = () => {
    type Callback = (data: any) => void;
    const fetchCsvData = async (filePath: string, callback: Callback) => {
        const response = await fetch(filePath)
        const reader = response.body!.getReader();
        const result = await reader.read()
        const decoder = new TextDecoder('')
    }
    return {
        fetchCsvData
    }
}
export default useFetch;