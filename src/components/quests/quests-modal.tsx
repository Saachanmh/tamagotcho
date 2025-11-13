'use client'

import { useEffect, useState } from 'react'
import { getUserQuests, claimQuestReward } from '@/actions/quests.actions'
import { QUEST_CATALOG, getNextResetDate } from '@/config/quests.config'
import type { ActiveQuest } from '@/db/models/userquests.model'
import { toast } from 'react-toastify'

interface QuestsModalProps {
  open: boolean
  onClose: () => void
  onKoinsUpdated?: () => void
}

/**
 * Modal de suivi des quêtes journalières
 *
 * Responsabilité : Afficher les quêtes actives, la progression,
 * et permettre de réclamer les récompenses
 */
export function QuestsModal ({ open, onClose, onKoinsUpdated }: QuestsModalProps): React.ReactNode {
  const [quests, setQuests] = useState<ActiveQuest[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [timeUntilReset, setTimeUntilReset] = useState('')

  // Charger les quêtes
  const loadQuests = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await getUserQuests()
      setQuests(data.activeQuests)
    } catch (error) {
      console.error('Error loading quests:', error)
      toast.error('Impossible de charger les quêtes')
    } finally {
      setLoading(false)
    }
  }

  // Charger les quêtes au montage et quand la modal s'ouvre
  useEffect(() => {
    if (open) {
      void loadQuests()
    }
  }, [open])

  // Timer pour le reset
  useEffect(() => {
    const updateTimer = (): void => {
      const now = new Date()
      const resetDate = getNextResetDate()
      const diff = resetDate.getTime() - now.getTime()

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => { clearInterval(interval) }
  }, [])

  // Réclamer une récompense
  const handleClaimReward = async (questId: string): Promise<void> => {
    try {
      setClaiming(questId)

      const result = await claimQuestReward(questId as any)

      if (result.success && result.reward != null) {
        toast.success(`🎉 ${result.reward} koins gagnés !`)

        // Recharger les quêtes
        await loadQuests()

        // Notifier le parent pour rafraîchir le solde
        if (onKoinsUpdated != null) {
          onKoinsUpdated()
        }
      } else {
        toast.error(result.error ?? 'Impossible de réclamer la récompense')
      }
    } catch (error) {
      console.error('Error claiming reward:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setClaiming(null)
    }
  }

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in'>
      <div className='bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ring-4 ring-purple-200/50 animate-slide-up'>
        {/* Header */}
        <div className='relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-6'>
          <div className='relative flex items-center justify-between'>
            <div>
              <h2 className='text-3xl font-black text-white mb-2 flex items-center gap-3'>
                🎯 Quêtes Journalières
              </h2>
              <p className='text-white/90 font-bold'>
                Complète les quêtes pour gagner des koins ! 💰
              </p>
            </div>
            <button
              onClick={onClose}
              className='text-white/80 hover:text-white text-4xl font-black hover:rotate-90 transition-all duration-300'
            >
              ×
            </button>
          </div>
        </div>

        {/* Timer de reset */}
        <div className='bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-3 border-b-2 border-amber-200'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-bold text-amber-800'>
              ⏰ Nouvelles quêtes dans :
            </span>
            <span className='text-lg font-black text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text'>
              {timeUntilReset}
            </span>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-200px)]'>
          {loading
            ? (
              <div className='flex flex-col items-center justify-center py-12'>
                <div className='text-6xl mb-4 animate-bounce'>🎯</div>
                <p className='text-xl font-bold text-gray-600'>Chargement des quêtes...</p>
              </div>
              )
            : (
              <div className='space-y-4'>
                {quests.map((quest) => {
                  const questDef = QUEST_CATALOG[quest.questId as keyof typeof QUEST_CATALOG]
                  const progress = Math.min((quest.progress / quest.target) * 100, 100)

                  return (
                    <div
                      key={quest.questId}
                      className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-2 transition-all duration-300 ${
                        quest.completed
                          ? 'ring-green-400 shadow-green-200'
                          : 'ring-purple-200 hover:ring-purple-400'
                      }`}
                    >
                      <div className='relative flex items-start gap-4'>
                        {/* Icône */}
                        <div className={`flex-shrink-0 text-5xl ${quest.completed ? 'animate-bounce-slow' : ''}`}>
                          {questDef.icon}
                        </div>

                        {/* Contenu */}
                        <div className='flex-1 min-w-0'>
                          {/* Titre et récompense */}
                          <div className='flex items-start justify-between gap-4 mb-3'>
                            <div>
                              <h3 className='text-xl font-black text-gray-800 mb-1'>
                                {questDef.title}
                              </h3>
                              <p className='text-sm font-medium text-gray-600'>
                                {questDef.description}
                              </p>
                            </div>
                            <div className='flex-shrink-0'>
                              <span className='inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-sm font-black text-white shadow-lg'>
                                🪙 {questDef.reward}
                              </span>
                            </div>
                          </div>

                          {/* Barre de progression */}
                          <div className='mb-3'>
                            <div className='flex items-center justify-between mb-2'>
                              <span className='text-xs font-bold text-gray-500 uppercase'>
                                Progression
                              </span>
                              <span className='text-sm font-black text-purple-600'>
                                {quest.progress} / {quest.target}
                              </span>
                            </div>
                            <div className='h-3 bg-gray-200 rounded-full overflow-hidden'>
                              <div
                                className='h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500 rounded-full'
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Bouton de réclamation */}
                          {quest.completed && !quest.claimed && (
                            <button
                              onClick={() => { void handleClaimReward(quest.questId) }}
                              disabled={claiming === quest.questId}
                              className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                              {claiming === quest.questId ? '⏳ Réclamation...' : '🎁 Réclamer la récompense'}
                            </button>
                          )}

                          {quest.claimed && (
                            <div className='flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl'>
                              <span className='text-2xl'>✅</span>
                              <span className='font-black text-green-700'>Récompense réclamée !</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              )}
        </div>

        {/* Footer avec stats */}
        <div className='bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 border-t-2 border-purple-200'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-bold text-purple-800'>
              {quests.filter(q => q.completed).length} / {quests.length} quêtes complétées
            </div>
            <div className='text-sm font-bold text-purple-800'>
              {quests.filter(q => q.claimed).length} / {quests.length} récompenses réclamées
            </div>
          </div>
        </div>
      </div>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      `}
      </style>
    </div>
  )
}

