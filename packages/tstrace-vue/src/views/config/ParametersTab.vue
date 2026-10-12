<template>
  <div class="notification is-danger" v-if="errors.length" style="margin: 1rem">
    <button class="delete" @click="clearErrors"></button>
    <span v-for="err in errors">{{ err }}</span>
  </div>
  <div :class="$style.columns">
    <div style="padding: 1rem; width: 600px; overflow-y: auto">
      <div style="display: flex; margin-bottom: 1rem">
        <file-upload @load="loadFromJson" style="margin-right: 0.5rem" label="Load from JSON" />
        <button class="button" @click="saveJson" style="margin-right: 0.5rem">Save JSON</button>
        <button
          class="button"
          @click="restoreDefaults"
          title="Set all parameters to their defaults (keeps the model input, phonology, and lexicon)"
        >
          Restore defaults
        </button>
      </div>
      <ConfigInput
        v-model="config.modelInput"
        :last-value="lastConfig.modelInput"
        :default-value="defaults.modelInput"
        label="Model Input"
        note=""
        :error="isModelInputValid ? '' : 'Model input contains invalid characters'"
        type="text"
      />
      <ContinuumSpecInput />
      <ConfigInput
        v-model="config.alpha.IF"
        :last-value="lastConfig.alpha.IF"
        :default-value="defaults.alpha.IF"
        label="ALPHA[if]"
        note="Input-Feature weights"
      />
      <ConfigInput
        v-model="config.alpha.FP"
        :last-value="lastConfig.alpha.FP"
        :default-value="defaults.alpha.FP"
        label="ALPHA[fp]"
        note="Feature-Phoneme weights"
      />
      <ConfigInput
        v-model="config.alpha.PW"
        :last-value="lastConfig.alpha.PW"
        :default-value="defaults.alpha.PW"
        label="ALPHA[pw]"
        note="Phoneme-Word weights"
      />
      <ConfigInput
        v-model="config.alpha.PF"
        :last-value="lastConfig.alpha.PF"
        :default-value="defaults.alpha.PF"
        label="ALPHA[pf]"
        note="Phoneme-Feature weights"
      />
      <ConfigInput
        v-model="config.alpha.WP"
        :last-value="lastConfig.alpha.WP"
        :default-value="defaults.alpha.WP"
        label="ALPHA[wp]"
        note="Word-Phoneme weights"
      />
      <ConfigInput
        v-model="config.gamma.F"
        :last-value="lastConfig.gamma.F"
        :default-value="defaults.gamma.F"
        label="GAMMA[f]"
        note="Feature layer inhibition"
      />
      <ConfigInput
        v-model="config.gamma.P"
        :last-value="lastConfig.gamma.P"
        :default-value="defaults.gamma.P"
        label="GAMMA[p]"
        note="Phoneme layer inhibition"
      />
      <ConfigInput
        v-model="config.gamma.W"
        :last-value="lastConfig.gamma.W"
        :default-value="defaults.gamma.W"
        label="GAMMA[w]"
        note="Word layer inhibition"
      />
      <ConfigInput
        v-model="config.decay.F"
        :last-value="lastConfig.decay.F"
        :default-value="defaults.decay.F"
        label="DECAY[f]"
        note="Feature decay"
      />
      <ConfigInput
        v-model="config.decay.P"
        :last-value="lastConfig.decay.P"
        :default-value="defaults.decay.P"
        label="DECAY[p]"
        note="Phoneme decay"
      />
      <ConfigInput
        v-model="config.decay.W"
        :last-value="lastConfig.decay.W"
        :default-value="defaults.decay.W"
        label="DECAY[w]"
        note="Word decay"
      />
      <ConfigInput
        v-model="config.rest.F"
        :last-value="lastConfig.rest.F"
        :default-value="defaults.rest.F"
        label="REST[f]"
        note="Feature resting activation"
      />
      <ConfigInput
        v-model="config.rest.P"
        :last-value="lastConfig.rest.P"
        :default-value="defaults.rest.P"
        label="REST[p]"
        note="Phoneme resting activation"
      />
      <ConfigInput
        v-model="config.rest.W"
        :last-value="lastConfig.rest.W"
        :default-value="defaults.rest.W"
        label="REST[w]"
        note="Word resting activation"
      />
      <ConfigInput
        v-model="config.noiseSD"
        :last-value="lastConfig.noiseSD"
        :default-value="defaults.noiseSD"
        label="Input Noise (SD)"
        note=""
      />
      <ConfigInput
        v-model="config.stochasticitySD"
        :last-value="lastConfig.stochasticitySD"
        :default-value="defaults.stochasticitySD"
        label="Stochasticity (SD)"
        note="McClelland: 0.02"
      />
      <ConfigInput
        v-model="config.stochasticity.F"
        :last-value="lastConfig.stochasticity.F"
        :default-value="defaults.stochasticity.F"
        label="STOCH[f]"
        note="Extra feature noise (SD)"
      />
      <ConfigInput
        v-model="config.stochasticity.P"
        :last-value="lastConfig.stochasticity.P"
        :default-value="defaults.stochasticity.P"
        label="STOCH[p]"
        note="Extra phoneme noise (SD)"
      />
      <ConfigInput
        v-model="config.stochasticity.W"
        :last-value="lastConfig.stochasticity.W"
        :default-value="defaults.stochasticity.W"
        label="STOCH[w]"
        note="Extra word noise (SD)"
      />
      <ConfigInput
        v-model="config.seed"
        :last-value="lastConfig.seed"
        :default-value="defaults.seed"
        label="Random seed"
        note="Blank = different noise every run; an integer repeats runs exactly"
        :step="1"
        nullable
      />
      <ConfigInput
        v-model="config.atten"
        :last-value="lastConfig.atten"
        :default-value="defaults.atten"
        label="Attention"
        note="Lexical gain"
      />
      <ConfigInput
        v-model="config.bias"
        :last-value="lastConfig.bias"
        :default-value="defaults.bias"
        label="Bias"
        note="Lexical bias"
      />
      <ConfigInput
        v-model="config.spreadScale[0]"
        :last-value="lastConfig.spreadScale[0]"
        :default-value="defaults.spreadScale[0]"
        label="spreadScale"
        note="Scales FETSPREADs"
      />
      <ConfigInput
        v-model="config.min"
        :last-value="lastConfig.min"
        :default-value="defaults.min"
        label="Min"
        note="Minimum activation"
      />
      <ConfigInput
        v-model="config.max"
        :last-value="lastConfig.max"
        :default-value="defaults.max"
        label="Max"
        note="Maximum activation"
      />
      <ConfigInput
        v-model="config.freqNode.RDL_rest_s"
        :last-value="lastConfig.freqNode.RDL_rest_s"
        :default-value="defaults.freqNode.RDL_rest_s"
        label="Frq resting levels"
      />
      <ConfigInput
        v-model="config.freqNode.RDL_wt_s"
        :last-value="lastConfig.freqNode.RDL_wt_s"
        :default-value="defaults.freqNode.RDL_wt_s"
        label="Frq phoneme->word weights"
      />
      <ConfigInput
        v-model="config.freqNode.RDL_post_c"
        :last-value="lastConfig.freqNode.RDL_post_c"
        :default-value="defaults.freqNode.RDL_post_c"
        label="Frq post act"
      />
      <ConfigInput
        v-model="config.primeNode.RDL_rest_s"
        :last-value="lastConfig.primeNode.RDL_rest_s"
        :default-value="defaults.primeNode.RDL_rest_s"
        label="Priming (rest)"
      />
      <ConfigInput
        v-model="config.primeNode.RDL_wt_s"
        :last-value="lastConfig.primeNode.RDL_wt_s"
        :default-value="defaults.primeNode.RDL_wt_s"
        label="Priming (weight)"
      />
      <ConfigInput
        v-model="config.primeNode.RDL_post_c"
        :last-value="lastConfig.primeNode.RDL_post_c"
        :default-value="defaults.primeNode.RDL_post_c"
        label="Priming (post-act)"
      />
      <ConfigInput
        v-model="config.spread[0]"
        :last-value="lastConfig.spread[0]"
        :default-value="defaults.spread[0]"
        label="FETSPREAD[pow]"
        note="Power feature spread"
        :step="1"
      />
      <ConfigInput
        v-model="config.spread[1]"
        :last-value="lastConfig.spread[1]"
        :default-value="defaults.spread[1]"
        label="FETSPREAD[voc]"
        note="Vocalic feature spread"
        :step="1"
      />
      <ConfigInput
        v-model="config.spread[2]"
        :last-value="lastConfig.spread[2]"
        :default-value="defaults.spread[2]"
        label="FETSPREAD[dif]"
        note="Diffuse feature spread"
        :step="1"
      />
      <ConfigInput
        v-model="config.spread[3]"
        :last-value="lastConfig.spread[3]"
        :default-value="defaults.spread[3]"
        label="FETSPREAD[acu]"
        note="Accute feature spread"
        :step="1"
      />
      <ConfigInput
        v-model="config.spread[4]"
        :last-value="lastConfig.spread[4]"
        :default-value="defaults.spread[4]"
        label="FETSPREAD[gra]"
        note="Gradient/Consonental feature spread"
        :step="1"
      />
      <ConfigInput
        v-model="config.spread[5]"
        :last-value="lastConfig.spread[5]"
        :default-value="defaults.spread[5]"
        label="FETSPREAD[voi]"
        note="Voiced feature spread"
        :step="1"
      />
      <ConfigInput
        v-model="config.spread[6]"
        :last-value="lastConfig.spread[6]"
        :default-value="defaults.spread[6]"
        label="FETSPREAD[bur]"
        note="Burst feature spread"
        :step="1"
      />
      <ConfigInput
        v-model="config.fSlices"
        :last-value="lastConfig.fSlices"
        :default-value="defaults.fSlices"
        label="fSlices"
        note="Number of time steps"
        :step="1"
      />
      <ConfigInput
        v-model="config.deltaInput"
        :last-value="lastConfig.deltaInput"
        :default-value="defaults.deltaInput"
        label="deltaInput"
        note="Input phoneme interval"
        :step="1"
      />
      <ConfigInput
        v-model="config.nreps"
        :last-value="lastConfig.nreps"
        :default-value="defaults.nreps"
        label="nreps"
        note="Input presentation rate"
        :step="1"
      />
      <ConfigInput
        v-model="config.slicesPerPhon"
        :last-value="lastConfig.slicesPerPhon"
        :default-value="defaults.slicesPerPhon"
        label="slicesPerPhon"
        note="Phoneme/Word slices per Feature"
        :step="1"
      />
      <ConfigInput
        v-model="config.lengthNormalization"
        :last-value="lastConfig.lengthNormalization"
        :default-value="defaults.lengthNormalization"
        label="lengthNormalization"
        note="0 or 1; normalize length effects."
      />
    </div>

    <div style="flex: 1; display: flex; align-items: center; justify-content: center">
      <ModelInputChart style="width: 700px; height: 500px" />
    </div>
  </div>
</template>

<script lang="ts">
import FileSaver from 'file-saver';
import { createDefaultConfig } from 'tstrace';
import { computed, defineComponent } from 'vue';
import ModelInputChart from '../../components/charts/ModelInputChart.vue';
import ConfigInput from '../../components/ConfigInput.vue';
import ContinuumSpecInput from '../../components/ContinuumSpecInput.vue';
import FileUpload from '../../components/FileUpload.vue';
import { getStore } from '../../store';

export default defineComponent({
  name: 'ParametersTab',
  components: {
    ConfigInput,
    ContinuumSpecInput,
    FileUpload,
    ModelInputChart,
  },
  setup() {
    const store = getStore();
    const errors: string[] = [];
    const defaults = createDefaultConfig();
    return {
      defaults,
      isModelInputValid: store.isModelInputValid,
      config: computed(() => store.config),
      lastConfig: computed(() => store.lastSimConfig.value),
      loadFromJson: (text: string) => {
        try {
          Object.assign(store.config, JSON.parse(text));
        } catch (err: any) {
          errors.push(err.message);
        }
      },
      saveJson: () => {
        const blob = new Blob([JSON.stringify(store.config, null, 2) + '\n'], {
          type: 'application/json',
        });
        FileSaver.saveAs(blob, 'config.json');
      },
      restoreDefaults: () => {
        // keep the model input and everything tied to the phonology and lexicon
        const {
          modelInput,
          phonology,
          lexicon,
          allophoneRelations,
          numFeatures,
          continuaPerFeature,
          ...params
        } = createDefaultConfig();
        Object.assign(store.config, params);
      },
      errors,
      clearErrors: () => errors.splice(0, errors.length),
    };
  },
});
</script>

<style module>
.columns {
  display: flex;
  height: 100%;
}
</style>
