// mlp.js — tiny feed-forward neural network with backprop training.
// Deterministic (seeded init) so runs are reproducible and testable.
// Sizes e.g. [2, 3, 1] -> 2 inputs, 3 tanh hidden, 1 sigmoid output.

import { mulberry32 } from '../../core/validation.js';
import { sigmoid, tanh } from './tensor.js';

export class MLP {
  constructor(sizes, { seed = 42, hiddenAct = 'tanh', outputAct = 'sigmoid' } = {}) {
    if (sizes.length < 2) throw new Error('MLP needs at least input and output layer sizes');
    this.sizes = sizes;
    this.hiddenAct = hiddenAct;
    this.outputAct = outputAct;
    const rng = mulberry32(seed);
    this.weights = []; // weights[l][i][j]: layer l, neuron j in layer l+1, input i
    this.biases = [];
    for (let l = 0; l < sizes.length - 1; l++) {
      const nin = sizes[l], nout = sizes[l + 1];
      const scale = Math.sqrt(2 / (nin + nout)); // Xavier-ish
      this.weights.push(Array.from({ length: nout }, () =>
        Array.from({ length: nin }, () => (rng() * 2 - 1) * scale * 2)));
      this.biases.push(new Array(nout).fill(0));
    }
  }

  _act(x, isOutput) {
    const fn = isOutput ? this.outputAct : this.hiddenAct;
    if (fn === 'tanh') return tanh(x);
    if (fn === 'relu') return Math.max(0, x);
    return sigmoid(x);
  }

  _actPrime(y, isOutput) {
    const fn = isOutput ? this.outputAct : this.hiddenAct;
    if (fn === 'tanh') return 1 - y * y;
    if (fn === 'relu') return y > 0 ? 1 : 0;
    return y * (1 - y); // sigmoid
  }

  /** forward one sample (array). Returns { out, zs, ys } for training. */
  forward(x) {
    const ys = [x];
    let a = x;
    const L = this.weights.length;
    for (let l = 0; l < L; l++) {
      const isOutput = l === L - 1;
      const W = this.weights[l], b = this.biases[l];
      const out = W.map((wrow, j) => {
        let s = b[j];
        for (let i = 0; i < wrow.length; i++) s += wrow[i] * a[i];
        return this._act(s, isOutput);
      });
      ys.push(out);
      a = out;
    }
    return { out: a, ys };
  }

  /** one full-batch gradient-descent epoch; returns MSE loss */
  trainEpoch(X, Y, lr = 0.5) {
    const L = this.weights.length;
    const gradW = this.weights.map((W) => W.map((row) => row.map(() => 0)));
    const gradB = this.biases.map((b) => b.map(() => 0));
    let loss = 0;
    for (let n = 0; n < X.length; n++) {
      const { out, ys } = this.forward(X[n]);
      const target = Y[n];
      for (let j = 0; j < out.length; j++) loss += (out[j] - target[j]) ** 2;
      // output delta (MSE + derivative-of-activation folded in)
      let delta = out.map((o, j) => (o - target[j]) * this._actPrime(o, true));
      for (let l = L - 1; l >= 0; l--) {
        const aPrev = ys[l];
        for (let j = 0; j < delta.length; j++) {
          gradB[l][j] += delta[j];
          for (let i = 0; i < aPrev.length; i++) gradW[l][j][i] += delta[j] * aPrev[i];
        }
        if (l > 0) {
          // propagate through weights to previous layer's pre-activation
          const W = this.weights[l];
          const newDelta = new Array(this.sizes[l]).fill(0);
          for (let i = 0; i < this.sizes[l]; i++) {
            let s = 0;
            for (let j = 0; j < delta.length; j++) s += W[j][i] * delta[j];
            newDelta[i] = s * this._actPrime(ys[l][i], false);
          }
          delta = newDelta;
        }
      }
    }
    // apply gradient descent
    for (let l = 0; l < L; l++) {
      for (let j = 0; j < this.weights[l].length; j++) {
        this.biases[l][j] -= lr * gradB[l][j] / X.length;
        for (let i = 0; i < this.weights[l][j].length; i++) {
          this.weights[l][j][i] -= lr * gradW[l][j][i] / X.length;
        }
      }
    }
    return loss / X.length;
  }

  train(X, Y, { epochs = 3000, lr = 0.8, verbose = false } = {}) {
    const history = [];
    for (let e = 0; e < epochs; e++) {
      const loss = this.trainEpoch(X, Y, lr);
      history.push(loss);
      if (verbose && e % 500 === 0) history.verbose = history.verbose || [];
    }
    return history;
  }

  predict(x) { return this.forward(x).out; }
}
