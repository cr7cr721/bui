import { useParams, Link } from 'react-router-dom'
import { useRules } from '@/hooks/useApi'
import { useStore } from '@/store/useStore'

export const RuleDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const { filters } = useStore()
    const { data: rules, isLoading } = useRules(filters.region, parseInt(filters.group))

    const rule = rules?.find(r => r.id === parseInt(id || ''))

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading rule details...</p>
            </div>
        )
    }

    if (!rule) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 text-xl mb-4">⚠️ Rule not found</div>
                <Link to="/" className="text-blue-600 hover:text-blue-800">
                    ← Back to Rules List
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
                    ← Back to Rules List
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{rule.name}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            rule.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
              {rule.enabled ? 'Enabled' : 'Disabled'}
            </span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Basic Info</h3>
                                <dl className="mt-2 space-y-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-900">ID</dt>
                                        <dd className="text-sm text-gray-700">{rule.id}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-900">Author</dt>
                                        <dd className="text-sm text-gray-700">{rule.author}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-900">Group</dt>
                                        <dd className="text-sm text-gray-700">{rule.group_name} (ID: {rule.group_id})</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-900">Version</dt>
                                        <dd className="text-sm text-gray-700">{rule.version}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Timestamps</h3>
                                <dl className="mt-2 space-y-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-900">Created</dt>
                                        <dd className="text-sm text-gray-700">
                                            {new Date(rule.created * 1000).toLocaleString()}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-900">Updated</dt>
                                        <dd className="text-sm text-gray-700">
                                            {new Date(rule.updated * 1000).toLocaleString()}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-900">Wake Time</dt>
                                        <dd className="text-sm text-gray-700">
                                            {rule.wake_time || 'Not set'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-900">Trigger Count</dt>
                                        <dd className="text-sm text-gray-700">{rule.trigger_count}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Regions</h3>
                        <div className="flex flex-wrap gap-2">
                            {rule.regions.map((region) => (
                                <span key={region} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {region}
                </span>
                            ))}
                        </div>
                    </div>

                    {rule.enabledIn.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Enabled In</h3>
                            <div className="flex flex-wrap gap-2">
                                {rule.enabledIn.map((region) => (
                                    <span key={region} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {region}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {rule.unknownIn.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Unknown In</h3>
                            <div className="flex flex-wrap gap-2">
                                {rule.unknownIn.map((region) => (
                                    <span key={region} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    {region}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}