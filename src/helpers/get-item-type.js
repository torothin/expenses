import { ItemName } from './item-names'

const getItemType = (inputString) => {
    const keys = Object.keys(ItemName);
    
    if(!inputString) return 'Other';

    for(const key of keys) {
        if(inputString.includes(key)) return ItemName[key];
    }
    return 'Other'; //other category
}

export default getItemType;