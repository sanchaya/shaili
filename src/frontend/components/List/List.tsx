import { Box, Pagination, Text } from '@adminjs/design-system'
import { ActionProps, RecordsTable, useRecords, useSelectedRecords } from 'adminjs'
import React, { useEffect } from 'react'
import { useLocation } from 'react-router'
import { getActionElementCss } from '../RecordInList/data-css-name.js'
import { useQueryParams } from './use-query-params.js'
import LanguageCards from '../LanguageCards/LanguageCards.js'
import LettersGroupedList from '../Letters/LettersGroupedList.js'

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
    } = useSelectedRecords(records || [])
    
    const location = useLocation()
    const { storeParams, filters, clearParams } = useQueryParams()

    // Show language cards (instead of the table) for these resources until a language filter is chosen
    const languageCardResources = ['books', 'letters', 'letter_types']
    const showLanguageCards =
        languageCardResources.includes(resource.id) && !filters?.language
    const showBackToLanguages =
        languageCardResources.includes(resource.id) && !!filters?.language
    const showGroupedLetters =
        resource.id === 'letters' && !!filters?.language

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

    if (showLanguageCards) {
        return (
            <Box variant="container" data-css={contentTag}>
                <LanguageCards
                    resourceId={resource.id}
                    onLanguageSelect={(code) =>
                        storeParams({
                            // Books open filtered to "In Progress" (book_status id 2)
                            filters: resource.id === 'books'
                                ? { language: code, status: '2' }
                                : { language: code },
                        })
                    }
                />
            </Box>
        )
    }

    if (showGroupedLetters) {
        return (
            <Box variant="container" data-css={contentTag}>
                {showBackToLanguages && (
                    <Box mb="lg">
                        <Text
                            as="span"
                            onClick={() => clearParams('filters')}
                            style={{
                                cursor: 'pointer',
                                color: '#3040d6',
                                fontWeight: 600,
                            }}
                        >
                            ‹ Back to all languages
                        </Text>
                    </Box>
                )}
                <LettersGroupedList languageCode={filters.language as string} />
            </Box>
        )
    }

    return (
        <Box variant="container" data-css={contentTag}>
            {showBackToLanguages && (
                <Box mb="lg">
                    <Text
                        as="span"
                        onClick={() => clearParams('filters')}
                        style={{
                            cursor: 'pointer',
                            color: '#3040d6',
                            fontWeight: 600,
                        }}
                    >
                        ‹ Back to all languages
                    </Text>
                </Box>
            )}
            {records && (
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
            )}
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
