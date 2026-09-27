import { Box, Button, Icon, Pagination, Text } from '@adminjs/design-system'
import { ActionProps, RecordsTable, useCurrentAdmin, useRecords, useSelectedRecords } from 'adminjs'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { getActionElementCss } from '../RecordInList/data-css-name.js'
import { useQueryParams } from './use-query-params.js'
import LanguageCards from '../LanguageCards/LanguageCards.js'
import LettersGroupedList from '../Letters/LettersGroupedList.js'
import BookFormModal from '../ViewBook/BookFormModal.js'
import { usePermissions } from '../../hooks/usePermissions.js'

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

    // Books are added from a popup (the header "Create new" is hidden for books).
    const [currentAdmin] = useCurrentAdmin()
    const { canAccess } = usePermissions(currentAdmin?.role || 0)
    const [addingBook, setAddingBook] = useState(false)
    const addBook = resource.id === 'books' && canAccess('books', 'new') && (
        <Box flex justifyContent="flex-end" mb="lg">
            <Button variant="contained" onClick={() => setAddingBook(true)}>
                <Icon icon="Plus" />
                Add book
            </Button>
            {addingBook && (
                <BookFormModal
                    language={filters?.language as string}
                    script={filters?.script as string}
                    onClose={() => setAddingBook(false)}
                    onSave={() => {
                        setAddingBook(false)
                        fetchData()
                    }}
                />
            )}
        </Box>
    )

    if (showLanguageCards) {
        return (
            <Box variant="container" data-css={contentTag}>
                {addBook}
                <LanguageCards
                    resourceId={resource.id}
                    onLanguageSelect={(code) =>
                        storeParams({ filters: { language: code } })
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

    const backLink = (label: string, param: string) => (
        <Text
            as="span"
            mr="xl"
            onClick={() => clearParams(param)}
            style={{
                cursor: 'pointer',
                color: '#3040d6',
                fontWeight: 600,
            }}
        >
            ‹ {label}
        </Text>
    )

    const recordsList = (
        <Box variant="container" data-css={contentTag}>
            {addBook}
            {showBackToLanguages && (
                <Box mb="lg">
                    {backLink('Back to all languages', 'filters')}
                    {filters?.script && backLink('Back to scripts', 'filters.script')}
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

    // Books: a language written in more than one script asks for the script before listing.
    if (resource.id === 'books' && filters?.language && !filters?.script) {
        return (
            <LanguageCards
                resourceId={resource.id}
                language={filters.language as string}
                onScriptSelect={(script) => storeParams({ filters: { ...filters, script } })}
                header={<>{addBook}<Box mb="lg">{backLink('Back to all languages', 'filters')}</Box></>}
            >
                {recordsList}
            </LanguageCards>
        )
    }

    return recordsList
}

export default List;
