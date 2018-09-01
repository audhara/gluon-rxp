import { delay, SagaIterator } from 'redux-saga'
import { call, put, select, spawn, take, takeEvery } from 'redux-saga/effects'
import Actions from '../Reducers/Actions'
import * as Selectors from '../Selectors'
import * as Enums from '../Enums'
import { map, forEach, isArray } from 'lodash'
import Config from '../Config'
import * as Services from '../Services'

import { decodeJWT } from 'did-jwt'

export function* signAnonymousClaim(action: any): SagaIterator {
  yield put(Actions.Process.start({type: Enums.ProcessType.SignClaim}))

  try {
    const jwt = yield call(Services.uPort.signAnonymousClaim, action.payload)
    const decodedClaim = yield call(decodeJWT, jwt)
    const signedClaim: VerifiableClaim = {
      ...decodedClaim.payload,
      jwt,
      source: {
        type: 'local',
      },
    }

    yield put(Actions.Contacts.addClaim(signedClaim))
  } catch (e) {
    yield put(Actions.App.handleError(e))
  }
  yield put(Actions.Process.end({type: Enums.ProcessType.SignClaim}))
}

export function* watchSignAnonymousClaim(): SagaIterator {
  yield takeEvery(Actions.Contacts.signAnonymousClaim, signAnonymousClaim)
}

export function* watchSignAnonymousClaimAndShareInRoom(): SagaIterator {
  while (true) {
    const action = yield take(Actions.Contacts.signAnonymousClaimAndShareInRoom)
    yield put(Actions.Process.start({type: Enums.ProcessType.SignClaim}))

    try {
      const jwt = yield call(Services.uPort.signAnonymousClaim, action.payload.unsigned)
      const decodedClaim = yield call(decodeJWT, jwt)
      const signedClaim: VerifiableClaim = {
        ...decodedClaim.payload,
        jwt,
        source: {
          type: 'local',
        },
      }

      yield put(Actions.Contacts.addClaim(signedClaim))
      const claims: any[] = []
      claims.push(jwt)

      const file = {
        fileName: 'claims.json',
        fileContent: JSON.stringify({claims}),
      }
      yield put(Actions.Matrix.sendFile(file))

    } catch (e) {
      yield put(Actions.App.handleError(e))
    }
    yield put(Actions.Process.end({type: Enums.ProcessType.SignClaim}))
  }
}

export function* watchSignClaimAndShareInRoom(): SagaIterator {
  while (true) {
    const action = yield take(Actions.Contacts.signClaimAndShareInRoom)
    yield put(Actions.Process.start({type: Enums.ProcessType.SignClaim}))

    try {
      yield put(Actions.Contacts.setRoomForSharing(action.payload.roomId))
      yield call(Services.uPort.signClaim, action.payload.unsigned)
    } catch (e) {
      yield put(Actions.App.handleError(e))
    }
  }
}

export function* handleSignedClaim(jwt: string): SagaIterator {

  try {
    const decodedClaim = yield call(decodeJWT, jwt)
    const signedClaim: VerifiableClaim = {
      ...decodedClaim.payload,
      jwt,
      source: {
        type: 'local',
      },
    }

    yield put(Actions.Contacts.addClaim(signedClaim))

    const roomId = yield select(Selectors.Contacts.getRoomForSharing)
    if (roomId) {
      const claims: any[] = []
      claims.push(jwt)
      const file = {
        fileName: 'claims.json',
        fileContent: JSON.stringify({claims}),
      }
      yield put(Actions.Matrix.sendFile(file))
    }

  } catch (e) {
    yield put(Actions.App.handleError(e))
  }
  yield put(Actions.Process.end({type: Enums.ProcessType.SignClaim}))

}

const decodeMultipleJWT = (jwts: string[]) => {
  return jwts.map(jwt => {
    return {
      jwt,
      decoded: decodeJWT(jwt),
    }
  })
    .map(claim => {
      return {
        ...claim.decoded.payload,
        source: {
          type: 'local',
        },
        jwt: claim.jwt,
      }
    })
}

export function* watchSaveClaimsLocally(): SagaIterator {
  while (true) {
    const action = yield take(Actions.Contacts.saveClaimsLocally)
    try {
      const decodedClaims = yield call(decodeMultipleJWT, action.payload)
      yield put(Actions.Contacts.addClaims(decodedClaims))

    } catch (e) {
      yield put(Actions.App.handleError(e))
    }
  }

}

export function* loadAndAppendMatrixClaims(action: any): SagaIterator {
  yield put(Actions.Process.start({type: Enums.ProcessType.LoadMatrixClaims}))

  try {
    const roomId = action.payload.roomId
    const url = action.payload.url
    console.log({roomId, url})
    const claims = yield call(loadClaim, url, roomId)

    yield put(Actions.Contacts.appendMatrixClaims(claims))
  } catch (e) {
    yield put(Actions.App.handleError(e))
  }
  yield put(Actions.Process.end({type: Enums.ProcessType.LoadMatrixClaims}))
}

export function* watchLoadAndAppendMatrixClaims(): SagaIterator {
  yield takeEvery(Actions.Contacts.loadAndAppendMatrixClaims, loadAndAppendMatrixClaims)
}

export function* watchLoadMatrixClaims(): SagaIterator {
  while (true) {
    const action = yield take(Actions.Contacts.loadMatrixClaims)
    yield put(Actions.Process.start({type: Enums.ProcessType.LoadMatrixClaims}))

    try {
      const claims = yield call(loadClaims, action.payload)

      yield put(Actions.Contacts.setMatrixClaims(claims))
    } catch (e) {
      yield put(Actions.App.handleError(e))
    }
    yield put(Actions.Process.end({type: Enums.ProcessType.LoadMatrixClaims}))
  }
}

const loadClaims = (roomsAndUrls: any) => {
  const promises: any = []
  forEach(roomsAndUrls, (room: any) => {
    forEach(room.urls, (url: string) => {
      promises.push(loadClaim(url, room.roomId))
    })
  })
  return Promise.all(promises).then((arr: any) => {
    let result: VerifiableClaim[] = []
    forEach(arr, (item: any) => {
      result = result.concat(item)
    })
    return result
  })
}

const loadClaim = (url: string, roomId: string) => {
  return fetch(url)
  .then((response: any) => response.json())
  .then((json: any) => {
    const result: VerifiableClaim[] = []
    if (json.claims && isArray(json.claims)) {
      forEach(json.claims, (jwt: string) => {
        try {
          const decodedClaim = decodeJWT(jwt)
          if (decodedClaim) {
            const signedClaim: VerifiableClaim = {
              ...decodedClaim.payload,
              jwt,
              source: {
                type: 'matrix',
                id: roomId,
              },
            }
            result.push(signedClaim)
          }
        } catch (e) {
          // invalid jwt
        }

      })
    }
    return result
  })
}
