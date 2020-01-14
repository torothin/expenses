import React from 'react';

const ListItem = (listItem) => {
    return (
        <li className='list-item'
            key = { listItem.Memo.transaction } >
                {listItem.Date} { ", " }
                {listItem.Name} { ", " }
                {listItem.Category} { ", " }
                {listItem.Amount}
        </li>

    )
}

export default ListItem;