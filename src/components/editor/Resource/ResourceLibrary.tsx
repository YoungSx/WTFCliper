import React from 'react';
import { Tabs } from 'antd'
import Private from "./Private"

import { dataBase } from '../../../utils/db'
import { SET_PRIVATE_RESOURCE } from '../../../redux/constants/resource'

import store from '../../../redux'

const { TabPane } = Tabs

export default class ResourceLibrary extends React.Component {
    databaseToStore () {
        let db = new dataBase('private_files')
        let private_files = db.read()
        store.dispatch(
            {
                type: SET_PRIVATE_RESOURCE,
                resource: private_files ? private_files : []
            }
        )
    }

    componentWillMount() {
        this.databaseToStore()
    }

    render () {
        return (
            <>
                <Tabs defaultActiveKey="1" tabPosition="left">
                    <TabPane tab="My medias" key="1">
                        <Private></Private>
                    </TabPane>
                </Tabs>
            </>
        )
    }
}