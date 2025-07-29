import { useStore } from '../../store/useStore'
import { useRules } from '../../hooks/useApi'
import {RulesFilters} from "../../components/RulesFilters/RulesFilters";
import { Link } from 'react-router-dom'

export const RulesListPage = () => {
    const { filters } = useStore()
    const { data: rules, isLoading, error } = useRules(filters.region, parseInt(filters.group))

    const filteredRules = rules?.filter(rule => {
        const matchesSearch = !filters.search ||
            rule.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            rule.author.toLowerCase().includes(filters.search.toLowerCase())

        const matchesEnabled = filters.enabled === 'all' ||
            (filters.enabled === 'enabled' && rule.enabled === 1) ||
            (filters.enabled === 'disabled' && rule.enabled === 0)

        return matchesSearch && matchesEnabled
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <RulesFilters />
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading rules...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <RulesFilters />
                <div className="text-center py-12">
                    <div className="text-red-600 text-xl mb-4">⚠️ Error loading rules</div>
                    <p className="text-gray-600">{error.message}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <RulesFilters />

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">
                        Rules ({filteredRules?.length || 0})
                    </h2>
                </div>

                <div className="divide-y divide-gray-200">
                    {filteredRules?.map((rule) => (
                        <div key={rule.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Link
                                            to={`/rules/${rule.id}`}
                                            className="text-lg font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            {rule.name}
                                        </Link>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            rule.enabled
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Author:</span> {rule.author}
                                        </div>
                                        <div>
                                            <span className="font-medium">Group:</span> {rule.group_name}
                                        </div>
                                        <div>
                                            <span className="font-medium">Version:</span> {rule.version}
                                        </div>
                                        <div>
                                            <span className="font-medium">Created:</span> {new Date(rule.created * 1000).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <span className="font-medium">Updated:</span> {new Date(rule.updated * 1000).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <span className="font-medium">Triggers:</span> {rule.trigger_count}
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <span className="font-medium text-sm text-gray-600">Regions:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {rule.regions.map((region) => (
                                                <span key={region} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {region}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRules?.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No rules found matching your filters.
                    </div>
                )}
            </div>
        </div>
    )
}