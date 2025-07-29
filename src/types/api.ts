export interface Group {
    id: number
    fullname: string
    ad_group: string
    write: boolean
    public: boolean
}

export interface User {
    username: string
    user: string
    fullName: string
    firstName: string
    lastName: string
    email: string
    admin: boolean
    groups: Group[]
}

export interface Region {
    name: string
    description: string
}

export interface Rule {
    id: number
    group_id: number
    group_name: string
    name: string
    author: string
    regions: string[]
    created: number
    updated: number
    enabled: number
    version: number
    trigger_count: number
    wake_time: string | null
    enabledIn: string[]
    unknownIn: string[]
}

export interface RuleFilters {
    region: string
    group: string
    search: string
    enabled: 'all' | 'enabled' | 'disabled'
}