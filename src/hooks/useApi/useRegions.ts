// hooks/useApi/useRegions.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { regionsService } from '@/services'

export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: regionsService.getAll,
    staleTime: 1000 * 60 * 30,
  })
}

export const useChromieRegions = () => {
  return useQuery({
    queryKey: ['chromie-regions'],
    queryFn: regionsService.getChromieRegions,
  })
}

export const useDisabledRegions = () => {
  return useQuery({
    queryKey: ['disabled-regions'],
    queryFn: regionsService.getDisabled,
  })
}

export const useToggleRegion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ region, enable }: { region: string; enable: boolean }) =>
      regionsService.toggle(region, enable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disabled-regions'] })
    },
  })
}
