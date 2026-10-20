import type { TransactionListItem } from '@safe-global/store/gateway/types'
import { TransactionListItemType, TransactionInfoType, ConflictType } from '@safe-global/store/gateway/types'
import { listenerMiddlewareInstance } from '@/store'
import { txHistorySlice } from '@/store/txHistorySlice'
import { swapOrderListener, swapOrderStatusListener, setSwapOrder, deleteSwapOrder } from '@/store/swapOrderSlice'
import * as notificationsSlice from '@/store/notificationsSlice'

import { type TypedStartListening } from '@reduxjs/toolkit'
import { type RootState, type AppDispatch } from '@/store' // adjust the import path as needed

type StartListeningType = TypedStartListening<RootState, AppDispatch> & {
  withTypes: () => TypedStartListening<RootState, AppDispatch>
} & jest.Mock
const createStartListeningMock = () => {
  const mock = jest.fn() as unknown as StartListeningType
  mock.withTypes = jest.fn().mockReturnValue(mock)
  return mock
}
describe('swapOrderSlice', () => {
  describe('swapOrderListener', () => {
    const listenerMiddleware = listenerMiddlewareInstance
    const mockDispatch = jest.fn()
    const startListeningMock = createStartListeningMock()

    beforeEach(() => {
      jest.clearAllMocks()
      listenerMiddleware.startListening = startListeningMock
      swapOrderListener(listenerMiddleware)
    })

    it('should not dispatch an event if the transaction is not a swapTx', () => {
      const nonSwapTransaction = {
        type: TransactionListItemType.TRANSACTION,
        conflictType: ConflictType.NONE,
        transaction: {
          id: '0x123',
          txInfo: {
            type: TransactionInfoType.TRANSFER,
          },
        },
      } as TransactionListItem

      const action = txHistorySlice.actions.set({
        loading: false,
        loaded: true,
        data: {
          results: [nonSwapTransaction],
        },
      })

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, { dispatch: mockDispatch })

      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('should not dispatch an event if the swapOrder status did not change', () => {
      const swapTransaction = {
        type: TransactionListItemType.TRANSACTION,
        conflictType: ConflictType.NONE,
        transaction: {
          id: '0x123',
          txInfo: {
            type: TransactionInfoType.SWAP_ORDER,
            uid: 'order1',
            status: 'open',
          },
        },
      } as unknown as TransactionListItem

      const action = txHistorySlice.actions.set({
        loading: false,
        loaded: true,
        data: {
          results: [swapTransaction],
        },
      })

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getOriginalState: () => ({
          swapOrders: {
            order1: {
              orderUid: 'order1',
              status: 'open',
            },
          },
        }),
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('should dispatch setSwapOrder if the swapOrder status changed', () => {
      const swapTransaction = {
        type: TransactionListItemType.TRANSACTION,
        conflictType: ConflictType.NONE,
        transaction: {
          id: '0x123',
          txInfo: {
            type: TransactionInfoType.SWAP_ORDER,
            uid: 'order1',
            status: 'fulfilled',
          },
        },
      } as unknown as TransactionListItem

      const action = txHistorySlice.actions.set({
        loading: false,
        loaded: true,
        data: {
          results: [swapTransaction],
        },
      })

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getOriginalState: () => ({
          swapOrders: {
            order1: {
              orderUid: 'order1',
              status: 'open',
            },
          },
        }),
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        setSwapOrder({
          orderUid: 'order1',
          status: 'fulfilled',
          txId: '0x123',
        }),
      )
    })

    it('should not dispatch setSwapOrder if the old status is undefined and new status is fulfilled, expired, or cancelled', () => {
      const swapTransaction = {
        type: TransactionListItemType.TRANSACTION,
        conflictType: ConflictType.NONE,
        transaction: {
          id: '0x123',
          txInfo: {
            type: TransactionInfoType.SWAP_ORDER,
            uid: 'order1',
            status: 'fulfilled', // Test with 'expired' and 'cancelled' as well
          },
        },
      } as unknown as TransactionListItem

      const action = txHistorySlice.actions.set({
        loading: false,
        loaded: true,
        data: {
          results: [swapTransaction],
        },
      })

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getOriginalState: () => ({
          swapOrders: {}, // Old status is undefined
        }),
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('swapOrderStatusListener', () => {
    const listenerMiddleware = listenerMiddlewareInstance
    const mockDispatch = jest.fn()
    const showNotificationSpy = jest.spyOn(notificationsSlice, 'showNotification')
    const startListeningMock = createStartListeningMock()

    beforeEach(() => {
      jest.clearAllMocks()
      listenerMiddleware.startListening = startListeningMock
      swapOrderStatusListener(listenerMiddleware)
    })

    it('should dispatch a notification if the swapOrder status is created and threshold is 1', () => {
      const swapOrder = {
        orderUid: 'order1',
        status: 'created' as const,
        txId: '0x123',
      }

      const action = setSwapOrder(swapOrder)

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getState: () => ({
          safeInfo: {
            data: {
              threshold: 1,
            },
          },
        }),
        getOriginalState: () => ({
          swapOrders: {},
        }),
      })

      expect(showNotificationSpy).toHaveBeenCalledWith({
        title: '订单已创建',
        message: '等待交易执行',
        groupKey: 'swap-order-status',
        variant: 'info',
      })
    })

    it('should dispatch a notification if the swapOrder status is created and there is nothing about this swap in the state and threshold is more than 1', () => {
      const swapOrder = {
        orderUid: 'order1',
        status: 'created' as const,
        txId: '0x123',
      }

      const action = setSwapOrder(swapOrder)

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getState: () => ({
          safeInfo: {
            data: {
              threshold: 2,
            },
          },
        }),
        getOriginalState: () => ({
          swapOrders: {},
        }),
      })

      expect(showNotificationSpy).toHaveBeenCalledWith({
        title: '订单已创建',
        message: '等待 8379 签名人确认',
        groupKey: 'swap-order-status',
        variant: 'info',
      })
    })

    it('should dispatch a notification if the swapOrder status is open and we have old status and threshold is 1', () => {
      const swapOrder = {
        orderUid: 'order1',
        status: 'open' as const,
        txId: '0x123',
      }

      const action = setSwapOrder(swapOrder)

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getState: () => ({
          safeInfo: {
            data: {
              threshold: 1,
            },
          },
        }),
        getOriginalState: () => ({
          swapOrders: {
            order1: {
              orderUid: 'order1',
              status: 'created', // Old status is not undefined
            },
          },
        }),
      })

      expect(showNotificationSpy).toHaveBeenCalledWith({
        title: '订单交易已确认',
        message: '等待 CoW Protocol 执行订单',
        groupKey: 'swap-order-status',
        variant: 'info',
      })
    })

    it('should dispatch a notification if the swapOrder status is presignaturePending', () => {
      const swapOrder = {
        orderUid: 'order1',
        status: 'presignaturePending' as const,
        txId: '0x123',
      }

      const action = setSwapOrder(swapOrder)

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getState: () => ({
          safeInfo: {
            data: {
              threshold: 1,
            },
          },
        }),
        getOriginalState: () => ({
          swapOrders: {},
        }),
      })

      expect(showNotificationSpy).toHaveBeenCalledWith({
        title: '订单等待签名',
        message: '等待 8379 签名人确认',
        groupKey: 'swap-order-status',
        variant: 'info',
      })
    })

    it('should dispatch a notification if the swapOrder status is open', () => {
      const swapOrder = {
        orderUid: 'order1',
        status: 'open' as const,
        txId: '0x123',
      }

      const action = setSwapOrder(swapOrder)

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getState: () => ({
          safeInfo: {
            data: {
              threshold: 1,
            },
          },
        }),
        getOriginalState: () => ({
          swapOrders: {},
        }),
      })

      expect(showNotificationSpy).toHaveBeenCalledWith({
        title: '订单交易已确认',
        message: '等待 CoW Protocol 执行订单',
        groupKey: 'swap-order-status',
        variant: 'info',
      })
    })

    it('should not dispatch a notification if the swapOrder status is fulfilled and old status is undefined', () => {
      const swapOrder = {
        orderUid: 'order1',
        status: 'fulfilled' as const,
        txId: '0x123',
      }

      const action = setSwapOrder(swapOrder)

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getState: () => ({
          safeInfo: {
            data: {
              threshold: 1,
            },
          },
        }),
        getOriginalState: () => ({
          swapOrders: {},
        }),
      })

      expect(showNotificationSpy).not.toHaveBeenCalled()
    })

    it('should dispatch a notification if the swapOrder status is fulfilled and old status is not undefined', () => {
      const swapOrder = {
        orderUid: 'order1',
        status: 'fulfilled' as const,
        txId: '0x123',
      }

      const action = setSwapOrder(swapOrder)

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getState: () => ({
          safeInfo: {
            data: {
              threshold: 1,
            },
          },
        }),
        getOriginalState: () => ({
          swapOrders: {
            order1: {
              orderUid: 'order1',
              status: 'open',
            },
          },
        }),
      })

      expect(showNotificationSpy).toHaveBeenCalledWith({
        title: '订单已执行',
        message: '订单已成功完成',
        groupKey: 'swap-order-status',
        variant: 'success',
      })

      expect(mockDispatch).toHaveBeenCalledWith(deleteSwapOrder('order1'))
    })

    it('should not dispatch a notification if the swapOrder status is expired and old status is undefined', () => {
      const swapOrder = {
        orderUid: 'order1',
        status: 'expired' as const,
        txId: '0x123',
      }

      const action = setSwapOrder(swapOrder)

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getState: () => ({
          safeInfo: {
            data: {
              threshold: 1,
            },
          },
        }),
        getOriginalState: () => ({
          swapOrders: {},
        }),
      })

      expect(showNotificationSpy).not.toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(deleteSwapOrder('order1'))
    })

    it('should dispatch a notification if the swapOrder status is expired and old status is not undefined', () => {
      const swapOrder = {
        orderUid: 'order1',
        status: 'expired' as const,
        txId: '0x123',
      }

      const action = setSwapOrder(swapOrder)

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getState: () => ({
          safeInfo: {
            data: {
              threshold: 1,
            },
          },
        }),
        getOriginalState: () => ({
          swapOrders: {
            order1: {
              orderUid: 'order1',
              status: 'open',
            },
          },
        }),
      })

      expect(showNotificationSpy).toHaveBeenCalledWith({
        title: '订单已过期',
        message: '订单已达到过期时间，现已失效',
        groupKey: 'swap-order-status',
        variant: 'warning',
      })

      expect(mockDispatch).toHaveBeenCalledWith(deleteSwapOrder('order1'))
    })

    it('should not dispatch a notification if the swapOrder status is cancelled and old status is undefined', () => {
      const swapOrder = {
        orderUid: 'order1',
        status: 'cancelled' as const,
        txId: '0x123',
      }

      const action = setSwapOrder(swapOrder)

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getState: () => ({
          safeInfo: {
            data: {
              threshold: 1,
            },
          },
        }),
        getOriginalState: () => ({
          swapOrders: {},
        }),
      })

      expect(showNotificationSpy).not.toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(deleteSwapOrder('order1'))
    })

    it('should dispatch a notification if the swapOrder status is cancelled and old status is not undefined', () => {
      const swapOrder = {
        orderUid: 'order1',
        status: 'cancelled' as const,
        txId: '0x123',
      }

      const action = setSwapOrder(swapOrder)

      const effect = startListeningMock.mock.calls[0][0].effect
      effect(action, {
        dispatch: mockDispatch,
        getState: () => ({
          safeInfo: {
            data: {
              threshold: 1,
            },
          },
        }),
        getOriginalState: () => ({
          swapOrders: {
            order1: {
              orderUid: 'order1',
              status: 'open',
            },
          },
        }),
      })

      expect(showNotificationSpy).toHaveBeenCalledWith({
        title: '订单已取消',
        message: '您的订单已取消',
        groupKey: 'swap-order-status',
        variant: 'warning',
      })
      expect(mockDispatch).toHaveBeenCalledWith(deleteSwapOrder('order1'))
    })
  })
})
