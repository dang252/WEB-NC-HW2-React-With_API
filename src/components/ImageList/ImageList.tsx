import axios from "axios"
import { useEffect, useRef, useState } from "react"
import config from "../../config/AxiosConfig"
import "./ImageList.css"
// import { useInfiniteQuery } from "react-query"

const ImageList = () => {
    const [searchInput, setSearchInput] = useState<string>("")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [imgs, setImgs] = useState<any>()
    const [searching, setSearching] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const currentPage = useRef<number>(1);
    const FetchImgs = async (page: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: any;
        console.log(searchInput, page)
        if (searchInput == "") {
            data = await axios.get(`https://api.unsplash.com/photos?page=${page}`, config).then((response) => response.data)
        }
        else {
            data = await axios.get(`https://api.unsplash.com/search/photos?page=${page}&query=${searchInput}`, config).then((response) => response.data.results)
        }
        if (page >= 2) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setImgs((previmgs: any) => [...previmgs, ...data])
        }
        else {
            setImgs(data)
        }
    }

    const onSearching = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        currentPage.current = 1;
        setSearching(true)
        FetchImgs(currentPage.current).then(() => setSearching(false))
    }

    useEffect(() => {
        FetchImgs(currentPage.current)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        let fetching: boolean = false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onScroll = (event: any) => {
            const { scrollHeight, scrollTop, clientHeight } = event.target.scrollingElement;
            // console.log(scrollHeight, scrollTop, clientHeight)
            if (!fetching && scrollHeight - scrollTop <= clientHeight + 50) {
                fetching = true;
                setLoading(true)
                currentPage.current += 1
                FetchImgs(currentPage.current).then(() => {
                    fetching = false;
                    setLoading(false)
                })
                // fetching = false;
            }
        }

        document.addEventListener("scroll", onScroll)

        return () => {
            document.removeEventListener("scroll", onScroll)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    console.log(imgs)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const imagesBoard: any = [[], [], []]
    // for (let i = 0; i < imgs.length(); i++) {
    //     imagesBoard[i % 3].push(<img src={imgs[i].urls?.regular} className="img" key={imgs[i].urls?.regular} />)
    // }

    return (
        <div className="container">
            {searching &&
                <div className="searching-modal">
                    <div className="loading" />
                    <p>Searching...</p>
                </div>}
            <div className="search-bar">
                <form
                    action="/"
                    onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                        onSearching(e)
                    }}
                >
                    <input type="text" value={searchInput} onChange={(e: React.FormEvent<HTMLInputElement>) => { setSearchInput(e.currentTarget.value) }}></input>
                    <input type="submit" value="Search" disabled={searching} />
                </form>
            </div>
            <div className="images-list">
                {imgs && imgs.map((image: { urls: { regular: string | undefined } }) => {
                    return (<img src={image?.urls?.regular} className="img" key={image?.urls?.regular} />)
                })}
            </div>
            {loading && <div className="loading" />}
        </div>
    )
}

export default ImageList