export function Icons({ icon }) {
    switch (icon) {
        case 'bold': 
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true"><path fillRule="evenodd" d="M8 5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4.5c2.481 0 4.5-1.165 4.5-4 0-1.698-.724-2.796-1.837-3.405C15.69 10.967 16 10.112 16 9c0-2.835-2.019-4-4.5-4H8Zm1 2v4h3c1.379 0 2-.857 2-2s-.621-2-2-2H9Zm0 6v4h4c1.379 0 2-.857 2-2s-.621-2-2-2H9Z" clipRule="evenodd"></path></svg>
            )

        case 'italic': 
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" aria-hidden="true"><path clipRule="evenodd" d="M9 6a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-2.167l-1.666 10H14a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h2.167l1.666-10H10a1 1 0 0 1-1-1Z"></path></svg>
            )

        case 'underline': 
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" aria-hidden="true"><path clipRule="evenodd" d="M9 5a1 1 0 0 1 1 1v5.5c0 1.343.556 2.5 2 2.5s2-1.157 2-2.5V6a1 1 0 1 1 2 0v5.657C16 13.804 14.469 16 12 16c-2.462 0-4-2.196-4-4.343V6a1 1 0 0 1 1-1ZM6 17a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2H6Z"></path></svg>
            )

        case 'checkmark':
            return (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"><path d="M7.707.293a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L3 3.586 6.293.293a1 1 0 0 1 1.414 0Z" fill="#2C6ECB"></path></svg>
            )

        case 'left-align':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" aria-hidden="true"><path clipRule="evenodd" d="M6 5a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2H6Zm0 4a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2H6Zm-1 5a1 1 0 0 1 1-1h7a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2H6Z"></path></svg>
            )

        case 'center-align':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" aria-hidden="true"><path clipRule="evenodd" d="M5 6a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Zm3 3a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2H8Zm0 8a1 1 0 1 0 0 2h9a1 1 0 1 0 0-2H8Zm-2-4a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2H6Z"></path></svg>
            )

        case 'right-align':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" aria-hidden="true"><path clipRule="evenodd" d="M14 5a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-4ZM9 9a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2H9Zm1 5a1 1 0 0 1 1-1h7a1 1 0 1 1 0 2h-7a1 1 0 0 1-1-1Zm-4 3a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2H6Z"></path></svg>
            )

        case 'bulleted-list':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" aria-hidden="true"><path clipRule="evenodd" d="M6 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4-2a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2h-8Zm-4 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4-2a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-8Zm-3 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm2 0a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Z"></path></svg>
            )

        case 'numbered-list':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true"><path d="M9 7a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Zm0 5a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Zm1 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-8Z" clipRule="evenodd"></path><path d="M7.122 7.734a.113.113 0 0 0-.114-.113h-.465V5.084a.113.113 0 0 0-.113-.113h-.78a.113.113 0 0 0-.102.066.771.771 0 0 1-.633.448.113.113 0 0 0-.1.113v.793a.113.113 0 0 0 .116.113 1.17 1.17 0 0 0 .48-.12v1.237h-.47a.113.113 0 0 0-.113.113v.686c0 .063.05.114.113.114h2.067a.114.114 0 0 0 .114-.114v-.686Zm.07 5.055a.113.113 0 0 0-.113-.114h-.98l.294-.259c.448-.396.776-.744.776-1.298v-.037a1.03 1.03 0 0 0-.339-.789c-.224-.2-.55-.313-.96-.313-.431 0-.76.138-.989.366a1.37 1.37 0 0 0-.378.846.113.113 0 0 0 .101.124l.83.084a.113.113 0 0 0 .124-.1.655.655 0 0 1 .093-.29.213.213 0 0 1 .187-.104c.084 0 .13.023.155.05.026.028.049.078.049.168v.028c0 .106-.056.23-.173.38-.117.147-.28.306-.472.484l-.905.835a.114.114 0 0 0-.037.083v.541c0 .063.051.114.114.114h2.51a.114.114 0 0 0 .113-.114v-.685Zm-.159 4.157a.82.82 0 0 0-.233-.179.79.79 0 0 0 .186-.163.812.812 0 0 0 .18-.53v-.014a.929.929 0 0 0-.355-.763c-.226-.177-.546-.264-.925-.264-.417 0-.739.12-.964.319a1.102 1.102 0 0 0-.367.744.113.113 0 0 0 .113.123h.798a.113.113 0 0 0 .113-.103c.007-.074.03-.114.063-.138.036-.028.102-.051.22-.051.09 0 .14.024.169.052.028.028.05.075.05.152v.014c0 .095-.027.149-.064.182-.04.035-.112.063-.243.063h-.308a.113.113 0 0 0-.113.114v.634c0 .063.05.113.113.113h.317c.137 0 .208.03.245.064.036.033.062.09.062.197v.037c0 .1-.028.157-.063.19-.036.034-.098.06-.202.06-.143 0-.213-.038-.25-.077-.04-.04-.061-.102-.067-.182a.113.113 0 0 0-.113-.104h-.81a.113.113 0 0 0-.114.121c.022.308.123.598.352.81.228.212.568.33 1.04.33.434 0 .78-.106 1.018-.307.24-.203.359-.49.359-.823v-.037a.851.851 0 0 0-.207-.584Z"></path></svg>
            )

        case 'link':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" aria-hidden="true"><path clipRule="evenodd" d="M8.968 19a3.943 3.943 0 0 1-2.807-1.163 3.972 3.972 0 0 1 0-5.612l1.72-1.719a.874.874 0 1 1 1.237 1.238l-1.72 1.718a2.222 2.222 0 0 0 0 3.138c.841.839 2.302.838 3.139 0l1.72-1.719a.875.875 0 1 1 1.238 1.238l-1.72 1.718A3.94 3.94 0 0 1 8.968 19Zm6.534-5.25a.874.874 0 0 1-.619-1.494l1.72-1.718a2.222 2.222 0 0 0 0-3.138c-.84-.839-2.302-.837-3.138 0l-1.72 1.719a.875.875 0 1 1-1.239-1.238l1.72-1.718A3.94 3.94 0 0 1 15.034 5c1.06 0 2.058.413 2.807 1.163a3.973 3.973 0 0 1 0 5.612l-1.72 1.719a.873.873 0 0 1-.618.256Zm-5.252.875a.874.874 0 0 1-.619-1.494l3.501-3.5a.875.875 0 1 1 1.238 1.238l-3.5 3.5a.874.874 0 0 1-.62.256Z"></path></svg>
            )
    }
}
