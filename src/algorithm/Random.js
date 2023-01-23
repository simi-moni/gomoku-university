function isPositiveNumber(x) {
    if (typeof x !== "number") return false;
    return x > 0 && Number.isFinite(x);
}

/**
 *
 * @param {object} _Par0
 * @param {number} _Par0._Alpha
 * @param {number} _Par0._Beta
 * @param {number} _Par0._Sqrt
 * @param {(lambda:number)=>number} _Par0._Exp
 */
function _Eval(_Par0) {
    let _Ux = 0;
    let _Vx = 0;
    let _Xx = 0;
    let _Yx = 0;
    let _Qx = 0;
    let _Count = 0;
    if (_Par0._Alpha < 1) {
        // small values of alpha
        // from Knuth
        for (;;) {
            // generate and reject
            _Ux = Math.random();
            do {
                _Vx = Math.random();
            } while (_Vx === 0);

            if (_Ux < _Par0._Px) {
                // small _Ux
                _Xx = Math.pow(_Vx, 1 / _Par0._Alpha);
                _Qx = Math.exp(-_Xx);
            } else {
                // large _Ux
                _Xx = 1 - Math.log(_Vx);
                _Qx = Math.pow(_Xx, _Par0._Alpha - 1);
            }

            if (Math.random() < _Qx) {
                return _Par0._Beta * _Xx;
            }
        }
    }

    if (_Par0._Alpha === 1) {
        return _Par0._Beta * _Par0._Exp(1);
    }

    if (_Par0._Alpha < 20.0 && Number.isInteger(_Par0._Alpha)) {
        _Count = _Par0._Alpha;
        // _Alpha is small integer, compute directly
        _Yx = Math.random();
        while (--_Count) {
            // adjust result
            do {
                _Ux = Math.random();
            } while (_Ux === 0);

            _Yx *= _Ux;
        }
        return _Par0._Beta * -Math.log(_Yx);
    }

    // no shortcuts
    for (;;) {
        // generate and reject
        _Yx = Math.tan(Math.PI * Math.random());
        _Xx = _Par0._Sqrt * _Yx + _Par0._Alpha - 1;
        if (
            0 < _Xx &&
            Math.random() <=
                (1 + _Yx * _Yx) *
                    Math.exp(
                        (_Par0._Alpha - 1) *
                            Math.log(_Xx / (_Par0._Alpha - 1)) -
                            _Par0._Sqrt * _Yx
                    )
        ) {
            return _Par0._Beta * _Xx;
        }
    }
}

/**
 *
 * @param {number} alpha shape parameter
 * @param {number} beta scale parameter
 */
export function gamma(alpha, beta) {
    if (typeof alpha !== "number") {
        throw new TypeError("alpha is not a number");
    }

    if (typeof beta !== "number") {
        throw new TypeError("beta is not a number");
    }

    if (!isPositiveNumber(alpha)) {
        throw new RangeError("alpha must be positive number");
    }

    if (!isPositiveNumber(beta)) {
        throw new RangeError("beta must be positive number");
    }

    const param = {
        _Alpha: alpha,
        _Beta: beta,
        _Px: Math.E / (alpha + Math.E),
        _Sqrt: Math.sqrt(2 * alpha - 1),
        _Exp(_Lambda) {
            return -Math.log(1 - Math.random()) / _Lambda;
        }
    };

    return _Eval(param);
}

/**
 * @param {number[]} a
 * @param {number[]} [out]
 */
export function dirichlet(a, out) {
    out = out || new Array(a.length);
    if (a.length !== out.length) {
        throw new RangeError("input and output dimension mismatch");
    }
    let sum = 0;
    for (let i = 0; i < out.length; i++) {
        out[i] = gamma(a[i], 1);
        sum += out[i];
    }
    for (let i = 0; i < out.length; i++) out[i] /= sum;
    return out;
}

/**
 *
 * @param {number} k
 * @param {number} a
 * @param {number[]} [out]
 */
export function dirichletK(k, a, out) {
    out = out || new Array(k);
    if (k !== out.length) {
        throw new RangeError("input and output dimension mismatch");
    }
    let sum = 0;
    for (let i = 0; i < out.length; i++) {
        out[i] = gamma(a, 1);
        sum += out[i];
    }
    for (let i = 0; i < out.length; i++) out[i] /= sum;
    return out;
}

/**
 *
 * @param {number[]} probs
 */
function randomPickWithWeight(probs) {
    probs = probs.reduce(
        (acc, p) => {
            let last = acc[acc.length - 1];
            acc.push(last + p);
            return acc;
        },
        [0]
    );
    let x = Math.random() * probs[probs.length - 1];
    return probs.findIndex((p) => p > x) - 1;
}

/**
 * @template T
 * @param {T[]} targets
 * @param {number[]} [weights]
 */
export function randomPick(targets, weights) {
    if (weights === null || typeof weights === "undefined")
        return targets[Math.floor(Math.random() * targets.length)];
    if (!Array.isArray(weights))
        throw new TypeError(`${weights} is not an array`);
    return targets[randomPickWithWeight(weights)];
}
