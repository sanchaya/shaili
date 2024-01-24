import { Box, Pagination, Text } from '@adminjs/design-system'
import { ActionProps, RecordsTable, useRecords, useSelectedRecords } from 'adminjs'
import React, { useEffect } from 'react'
import { useLocation } from 'react-router'
import { getActionElementCss } from '../record-in-list/data-css-name.js'
import { useQueryParams } from './use-query-params.js'

const List: React.FC<ActionProps> = ({ resource, setTag }) => {
    const {
        records,
        loading,
        direction,
        sortBy,
        page,
        total,
        fetchData,
        perPage,
    } = useRecords(resource.id)

    const {
        selectedRecords,
        handleSelect,
        handleSelectAll,
        setSelectedRecords,
    } = useSelectedRecords(records)
    
    const location = useLocation()
    const { storeParams } = useQueryParams()

    useEffect(() => {
        if (setTag) {
            setTag(total.toString())
        }
    }, [total])

    useEffect(() => {
        setSelectedRecords([])
    }, [resource.id])

    useEffect(() => {
        const REFRESH_KEY = 'refresh'
        const search = new URLSearchParams(location.search)
        if (search.get(REFRESH_KEY)) {
            setSelectedRecords([])
        }
    }, [location.search])

    const handleActionPerformed = (): any => {
        fetchData()
        let remaining = (total - 1) % perPage;

        if (remaining === 0 && page > 1) {
            storeParams({ page: (page - 1).toString() })
        }
    }

    const handlePaginationChange = (pageNumber: number): void => {
        storeParams({ page: pageNumber.toString() })
    }

    const contentTag = getActionElementCss(resource.id, 'list', 'table-wrapper')

    return (
        <Box variant="container" data-css={contentTag}>
            <RecordsTable
                resource={resource}
                records={records}
                actionPerformed={handleActionPerformed}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                selectedRecords={selectedRecords}
                direction={direction}
                sortBy={sortBy}
                isLoading={loading}
            />
            <Text mt="xl" textAlign="center">
                <Pagination
                    page={page}
                    perPage={perPage}
                    total={total}
                    onChange={handlePaginationChange}
                />
            </Text>
        </Box>
    )
}

export default List;
