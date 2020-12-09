import { BaseFileType, TrackItemModel, TrackModel } from '../model/type'
import { UPDATE_ITEM, UPDATE_ITEM_TIME, ADD_RESOURCE_TO_TRACK } from './constants/makers'

import { deepCopy } from '../utils/tool'
import { UUID } from '../utils/file'

const initialState = {
    tracks: [
        {
            id: 'uj8ajnm32tnb',
            items: [
                {
                    id: 'xxxxxxitem1',
                    clip_from: 0,
                    clip_duration: 1000,
                    from: 2000
                },
                {
                    id: 'xxxxxxitem2',
                    clip_from: 0,
                    clip_duration: 1000,
                    from: 14000
                }
            ]
        }
    ],
    selectedTrackItemsId: [] 
}

export const getTracks = (state = initialState) => state.tracks

const updateItemTime = (state = initialState, itemInfoList: [any]) => {
    let newState = deepCopy(state)
    itemInfoList.forEach(itemInfo => {
        let trackIndex = 0, itemIndex = 0, founded = false
        for (; trackIndex < state.tracks.length && !founded; trackIndex++) {
            for (; itemIndex < state.tracks[trackIndex].items.length && !founded; itemIndex++) {
                if (state.tracks[trackIndex].id === itemInfo.trackId
                    && state.tracks[trackIndex].items[itemIndex].id === itemInfo.itemId) {
                        newState.tracks[trackIndex].items[itemIndex] = Object.assign(newState.tracks[trackIndex].items[itemIndex], {
                            from: itemInfo.from,
                            clip_from: itemInfo.clip_from,
                            clip_duration: itemInfo.clip_duration
                        })
                }
            }
        }
    })
    return newState
}

const fileToItem = (file: BaseFileType) => {
    return {
        id: UUID(),
        from: 0,
        clip_from: 0,
        clip_duration: 1000
    }
}

export const getInsertPos = (state = initialState, time: number, duration: number, track: TrackModel) => {
    time = time > 0 ? time : 0
    let result: {
        valid: boolean,
        index: number,
        from: number,
        duration: number
    }
    // init
    result = {
        valid: false,
        index: -1,
        from: -1,
        duration: -1
    }
    // 插到最后
    if (track.items.length == 0 || time >= (track.items[track.items.length - 1].from + track.items[track.items.length - 1].clip_duration)) {
        result = {
            valid: true,
            index: track.items.length ? track.items.length : 0,
            duration: duration,
            from: time
        }
    } else {
        // 去插缝（包括最前面）
        for (let i = -1; i < track.items.length - 1; i++) {
            let preTlEnd = i >= 0 ? track.items[i].from + track.items[i].clip_duration : 0
            let nextTlStart = track.items[i + 1].from
            // 找到缝隙
            if (time > preTlEnd && time < nextTlStart) {
                // 如果 time + duration 没超出下一个 tlStart
                if (time + duration <= nextTlStart) {
                    result = {
                        valid: true,
                        index: i + 1,
                        duration: duration,
                        from: time
                    }
                    break
                } else if (nextTlStart - preTlEnd >= duration) {
                    // time + duration 超出下一个 from, 且 tlEnd 接下一个 from, duration 可以原长向前延伸
                    result = {
                        valid: true,
                        index: i + 1,
                        duration: duration,
                        from: nextTlStart - duration
                    }
                    break
                } else {
                    // time + duration 超出下一个 from, 且中间缝隙不足以放下整个，tlEnd 接下一个 from, duration 取缝隙大小
                    result = {
                        valid: true,
                        index: i + 1,
                        duration: nextTlStart - preTlEnd,
                        from: preTlEnd
                    }
                    break
                }
            }
        }
    }
    return result
}

const addItemToTrack = (state = initialState, item: TrackItemModel, trackId: string, itemIndex: number) => {
    let newState = deepCopy(state)
    for (let trackIndex = 0, founded = false; trackIndex < newState.tracks.length && !founded; trackIndex++) {
        if (newState.tracks[trackIndex].id == trackId) {
            itemIndex = itemIndex ? itemIndex : newState.tracks[trackIndex].items.length
            newState.tracks[trackIndex].items.splice(itemIndex, 0, item)
        }
    }
    return newState
}

const addResourceToTrack = (state = initialState, file: BaseFileType, timeFrom: number, clip_duration: number, trackId: string, itemIndex: number) => {
    let item: TrackItemModel = Object.assign(fileToItem(file), {
        from: timeFrom,
        clip_duration: clip_duration
    })
    return addItemToTrack(state, item, trackId, itemIndex)
}

const makers = (state = initialState, action: any) => {
    switch (action.type) {
        case UPDATE_ITEM:
            break
        case UPDATE_ITEM_TIME:
            return updateItemTime(state, action.itemInfoList)
        case ADD_RESOURCE_TO_TRACK:
            return addResourceToTrack(state, action.file, action.timeFrom, action.clip_duration, action.trackId, action.itemIndex)
        default:
            return state
    }
}

export default makers