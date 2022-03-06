import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify';
import styles from '../assets/styles/SearchInput.module.scss'
interface Props {
  word?: string
}
export const SearchInput = (props: Props) => {
  const history = useHistory();
  const [value, setValue] = useState<string>('')

  const handleChange = (e) => {
    setValue(e.target.value.toLowerCase())
    e.preventDefault()
  }
  const handleKeyUp = (e: any) => {
    if (e.keyCode === 13) {
      goSearch()
    }
  }

  const goSearch = () => {
    if (value.split('.')[0].length > 3) {
      history.push(`/search/${value}`)
    } else {
      toast.error("second level name must be more than 6 characters", {
        position: "top-center",
        autoClose: 2000,
        theme: 'dark'
      })
    }
  }
  useEffect(() => {
    setValue(props.word || "")
  }, [props.word])

  return (
    <div className={styles['search-input-wrap']}>
      <div className={styles['search-input-inner']}>
        <div className={styles['search-input-main']}>
          <input className={styles['input-search']}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            value={value}
            type="text" placeholder="Search names or addresses" />
          <button className={styles['btn-search']} onClick={(e) => { goSearch() }}><i className="bi bi-search"></i></button>
        </div>
      </div>
    </div>
  )
}
