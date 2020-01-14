import React, { Component } from 'react';
import * as Papa from 'papaparse';
import './import-from-file.style.scss';
import getItemType from '../../helpers/get-item-type'
import ListItem from '../list-item/list-item.component'
import { VictoryBar, VictoryStack } from 'victory';
import { purchaseCategories } from '../../helpers/item-names'

/*

modified from https://medium.com/@ilonacodes/front-end-shorts-how-to-read-content-from-the-file-input-in-react-17f49b293909

*/

class ImportFromFile extends Component {
    constructor(props) {
        super(props);
        this.state={
            fileReader: new FileReader(),
            parsedContent: null,
            data: {
                "Jan": [],
                "Feb": [],
                "Mar": [],
                "Apr": [],
                "May": [],
                "Jun": [],
                "Jul": [],
                "Aug": [],
                "Sep": [],
                "Oct": [],
                "Nov": [],
                "Dec": [],
            },
            categoryTotals : {},
            totals: {
                // data needs to be like this:
                //
                // "cat1": {[ {x: "Jan", y: 532.56}, {x: "Feb", y: 32.50}, ... {x: "Dec", y: 1045.23}]},
                // "cat2": {[ {x: "Jan", y: 12.56}, {x: "Feb", y: 368.90}, ... {x: "Dec", y: 103.24}]},
                // ... "catn"
            },
        };
    }

    render() {
        return (
            <div className='upload-file'>
                {
                    !this.state.parsedContent && 
                    <input 
                        type='file'
                        id='file'
                        className='input-file'
                        accept='.csv'
                        onChange={ e => this.handleFileChosen(e.target.files[0])}
                    />
                }
                {
                    this.state.parsedContent &&               
                    <div className='data-container'>
                        {
                            
                            Object.keys(this.state.categoryTotals).map((month) => {
                                const categoryMonth = this.state.categoryTotals[month];
                                if(categoryMonth['total spent'] > 0) {
                                    return(
                                        <div className='category-item'>
                                        {month}{': '}{JSON.stringify(categoryMonth)}
                                        </div>)
                                }
                                return null;
                            })
                        }

                    </div>
                }
                {
                    this.state.parsedContent && 
                    <div className='data-container'>
                        <ul>
                            {
                                this.state.parsedContent && 
                                this.state.parsedContent.map((item) => {
                                    this.fixMemo(item);
                                    return( <ListItem {...item} />);
                                })
                            }
                        </ul>
                    </div>
                }
            </div>
        )
    }

    handleFileRead = (e) => {
        const content =  this.state.fileReader.result;
        let dataArray = Papa.parse(content,{header:true}).data;
        dataArray.pop();
        this.updateCategory(dataArray);
        const { data, categoryTotals } = this.createData(dataArray);
        this.setState({parsedContent: dataArray, data: data, categoryTotals: categoryTotals});
    }

    handleFileChosen = (file) => {
        const {fileReader} = this.state;
        fileReader.onloadend = this.handleFileRead;
        fileReader.readAsText(file);
    }

    updateCategory = (list) => {
        for(const item in list) {
            const name = list[item].Name;
            list[item].Category = getItemType(name);
        }
    }

    fixMemo = item => {
        let newMemo = {transaction: "", type: ""};
        if(!isNaN(Number(item.Memo.substring(0,1)))) {
            newMemo.transaction = item.Memo.substring(0,23);
            newMemo.type = item.Memo.substring(25,30);
        }
        item.Memo = newMemo;
    }

    createData = (dataArray) => {
        const parsedData = dataArray;
        const data = this.state.data;
        for(const item in parsedData)
        {
            const tempItem = {...parsedData[item]};
            
            if(tempItem.Transaction === 'DEBIT')
            {
                const itemDate = new Date(tempItem.Date);
                const itemMonthString = itemDate.toString().slice(4,7);
                data[itemMonthString].push(tempItem);
            }
        }
        const category = this.splitCategories(data);
        return ({data: data, categoryTotals: category});
    }

    splitCategories = (dataArray) => {
        const categoryTotals = {};
        for(const month in dataArray) {
            const monthData = dataArray[month];
            categoryTotals[month] = {"total spent":0};
            let categoryTotalsMonth = {...categoryTotals[month]};
            for(const index in monthData) {
                const indexData = monthData[index];
                categoryTotalsMonth["total spent"] += indexData.Amount * -1;
                if(!(indexData.Category in categoryTotalsMonth)) {
                    categoryTotalsMonth[indexData.Category] = indexData.Amount * -1;
                }
                else {
                    categoryTotalsMonth[indexData.Category] += indexData.Amount * -1;
                }
            }
            
            // fixes decimal issues
            Object.keys(categoryTotalsMonth).map((category) => {
                categoryTotalsMonth[category] = Number(categoryTotalsMonth[category].toFixed(2));
            });

            categoryTotals[month] = categoryTotalsMonth;
        }
        
        return categoryTotals;
    }
};

export default ImportFromFile;