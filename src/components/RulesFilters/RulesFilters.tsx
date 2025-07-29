import { useForm } from 'react-hook-form'
import { useStore } from '../../store/useStore'
import { useUser, useRegions } from '../../hooks/useApi'
import type { RuleFilters } from '../../types/api'

export const RulesFilters = () => {
    const { filters, setFilters, resetFilters } = useStore()
    const { data: user } = useUser()
    const { data: regions } = useRegions()

    const { register, handleSubmit, reset } = useForm<RuleFilters>({
        defaultValues: filters
    })

    const onSubmit = (data: RuleFilters) => {
        setFilters(data)
    }

    const handleReset = () => {
        resetFilters()
        reset()
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Filter Rules</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Region
                        </label>
                        <select
                            {...register('region')}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            {regions?.map((region) => (
                                <option key={region.name} value={region.name}>
                                    {region.name} - {region.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Group
                        </label>
                        <select
                            {...register('group')}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            {user?.groups?.map((group) => (
                                <option key={group.id} value={group.id.toString()}>
                                    {group.fullname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            {...register('enabled')}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Rules</option>
                            <option value="enabled">Enabled Only</option>
                            <option value="disabled">Disabled Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search rules..."
                            {...register('search')}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Apply Filters
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </form>
        </div>
    )
}