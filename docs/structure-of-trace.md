<center>

# The structure of TRACE

</center>

```
This is documentation of unknown provenance which someone shared with
me in the 1990s... To my chagrin, I can't recall who shared it, if
they were the author, or if they told me who the author was. I've
tried really hard to find the source and author, but have not been
able to track down either. This documentation has been invaluable,
and I am immensely grateful to the author -- if you know who that is,
please let me know!

I have lightly edited the text here and there, but this is not my work.
I have not verified every detail, so caveat lector...

                                        -- Jim Magnuson, March, 2022
```

> **Editor's note (2026).** This document describes the original TRACE
> specification. Some parameter names and mechanisms below differ from
> what tsTRACE exposes in its GUI — in particular:
>
> - The `<FREQSCALE>` parameter described below corresponds, in current
>   tsTRACE, to *three separate* word-frequency mechanisms (`frq
>   resting`, `Frq phoneme->word weights`, and `Frq post act`) following
>   Dahan, Magnuson, & Tanenhaus (2001). See the *Config-Parameters*
>   section of the <a href="tstrace-user-guide.md" data-tstrace-doc="user-guide">User Guide</a> for details.
> - Per-input parameters such as `<RATEp(i)>` and `<STRENGTHp(i)>` are
>   not user-facing in tsTRACE; the model uses fixed defaults.
> - The total-inhibition cap `<WIMAX>` mentioned below is not exposed.
>
> Use this document for the conceptual / mathematical specification of
> the model; consult the <a href="tstrace-user-guide.md" data-tstrace-doc="user-guide">User Guide</a> for the
> runtime parameters you can actually adjust.

The TRACE model is an interactive activation model, consisting of three levels of activation: the **feature, phoneme,** and **word** levels.

The **feature** level is a set of continuums  for  phonological  features; the  values  in  it  are  represented as separate units in TRACE.  For every time-slice there exists a set of these units, so the  number  of nodes at the feature level can be calculated from: the number of continuums * the number of values per  continuum  *  the number of feature time-slices.

At the **phoneme** level there is a separate unit  for  every  phoneme  on every  phoneme time-slice.  The number of phonemes is specified in the program.  Usually the number of phoneme time-slices is higher than the number  of feature time-slices; the ratio between the two is specified in the variable ``<FPP>``, so:

``<NFSLICES> = <FPP> * <NPSLICES>``

where ``<NFSLICES>`` is the number of feature time-slices;  ``<FPP>``  is  the feature/phoneme ratio; and ``<NPSLICES>`` is the number of phoneme-slices.

At the **word** level we have a separate word-node for  every  time-slice. The  number of words known to TRACE is dependent on the lexicon, which the user needs to specify.  The number of word time-slices is equal to the number of phoneme time-slices.

In TRACE there are a lot of parameters; many of  them  are  accessible for  the user, so they can change them.  The parameters are important in calculating the activation values of the  units  in  the  model.   All parameters have a fixed value once the program has started; this means that there is no learning possibility in the program.

There are connections between  and  within  levels.   The  connections between  levels  are  **excitatory**, those within levels **inhibitory**.  For both types of connections there exists a weighting value.  For **between level  connections** this value is called **ALPHA**; there is an ALPHA value for the phoneme/feature connections in both  directions  and  for  the phoneme/word  connections  in  both  directions,  called  ``<ALPHA[fp]>``, ``<ALPHA[pf]>``, ``<ALPHA[pw]>``, and ``<ALPHA[wp]>`` respectively.

For the within  levels  the  **scaling  values**  are  called  ``<GAMMA[f]>``, ``<GAMMA[p]>``,  and  ``<GAMMA[w]>``  for  the feature, phoneme and word level respectively. [Editor's note: the *scaling* values are more commonly referred to as the gain of ***lateral inhibition***.]

Every  unit  has  a  **resting  level**,  here  specified  as   ``<REST[f]>``, ``<REST[p]>``,  and  ``<REST[w]>``  for every separate level.  There is also a minimum and maximum value for every unit.  They are called  ``<MIN>``  and
``<MAX>`` and have the same value for units at all levels.

All units have a **decay-rate**, it has a different value for every  level and will be symbolized by ``<DECAY[f]>``, ``<DECAY[p]>`` and ``<DECAY[w]>``.

The acoustic input  to  TRACE  can  be  weighted  for  every  separate continuum   to   calculate  the  excitation  from  the  input  to  the feature-nodes.  These **input-to-feature weights** will be refered to by ``<FWEIGHTc>``,  where ``<c>`` is the name of the continuum.

The **base phoneme-width** in time-slices is specified  as  ``<PWIDTH>``;  the **base phoneme-overlap** in time-slices is specified as ``<POVERLAP>``.  These values are used to calculate the phoneme durations at the phoneme  and word level.

For the **total inhibition** at the word level there is a maximum; we will call it ``<WIMAX>``.

The **word-frequency** effects in TRACE can be controlled by the  parameter ``<FREQSCALE>``; the higher the value, the more word-frequency effects the activations of the word units.  The absolute frequency of a  word  can be specified by the user in the lexicon file.

### APPLYING INPUT TO THE TRACE MODEL

All the input to TRACE is applied to the feature-units.  To  calculate the  input  to  the feature-nodes out of the data from the input-file, which consists of  a  set  of  phoneme-specifications,  the  following procedure has to be executed:

- for every phoneme in the input the rate ``<RATEp(i)>`` is  specified  in   the input-file.

- for every phoneme  in  the  input  the  strength  ``<STRENGTHp(i)>``  is  specified in the input-file.

- to every separate phoneme a value is assigned, which  specifies  the  phoneme's susceptibility ``<SUSp>`` to the rate-factor.

- to every separate phoneme a value is assigned, which  specifies  the  relative width ``<WSCALEp>`` of the phoneme.

- for every separate phoneme an integer  value  is  calculated,  which  specifies the intrinsic duration of that phoneme by the formula:

  ``<DURp> = <WSCALEp> * <PWIDTH>``

  where ``<DURp>`` is the  phoneme's  intrinsic  duration;  ``<WSCALEp>``  the  phoneme-width's  scaling factor; and ``<PWIDTH>`` the base phoneme-width  in time-slices.  To get an integer as result the obtained value will  be rounded down.

- for every phoneme in the input an integer value is calculated, which  specifies  the time-slice, at which the phoneme's input will be at a  maximum.  This value can be obtained by the formula:

  ```
    <PEAKp(i)> = <RATEp(i)> * <SUSp(i)> * <DURp(i)>      for i = 1
               = <PEAKp(i-1)>
                  + <RATEp(i-1)> * <SUSp(i-1)> * <DURp(i-1)>
                  + <RATEp(i)> * <SUSp(i)> * <DURp(i)>    otherwise
  ```  
  where  ``<PEAKp(i)>``  is  the  i-th  input-phoneme's  peak  time-slice;  ``<RATEp(i)>``   its   rate;   ``<SUSp(i)>``  its  rate-susceptibility;  and ``<DURp(i)>`` its intrinsic duration.   To  get  an  integer  value  the obtained value should be rounded down.

- to every feature-continuum a value is assigned, which indicates  the  relative  spread  over  time-slices ``<FETSPREADc>`` of the input to the  continuum-values.

- for every phoneme in the input and each feature-continuum a value is  calculated,  which  specifies  the spread of that particular phoneme  over time-slices to the continuum, by the formula:

  ``<SPRp(i),c> = <RATEp(i)> * <FETSPREADc>``

  where ``<SPRp(i),c>``  is  the  spread  of  the  i-th  input-phoneme  to   continuum c; ``<RATEp(i)>`` is the rate of the phoneme; and ``<FETSPREADc>``   is the relative spread to the continuum-values.

- for every time-slice on which an input-phoneme is active  (within  a  distance  ``<SPRp(i),c>`` from ``<PEAKp(i)>``) and every feature-continuum a  value is calculated, which scales the input to the  continuum-values  as  a  function of the distance from the time-slice to the phoneme's  maximum.  The factor ensures a linear decreasing of the input-value,  when  the distance is increasing.  This value can be obtained by the  formula:

  ```
  <WEIGHTp(i),c,fs> = (1 - |<PEAKp(i)> - <fs>|) / <SPRp(i),c>
  ````

  where  ``<WEIGHTp(i),c,fs>``  is  the  scaling  factor  to  the   input;   ``<PEAKp(i)>``  is  the  i-th phoneme's peak time-slice; and ``<SPRp,c>`` is   the spread of the phoneme-input to the continuum.

- to every phoneme and every feature-value on each continuum  a  value   ``<FETVALp,c,f>``  is  assigned,  which  specifies  the  ability  of the  phoneme to excite that particular feature-value on  that  particular  continuum.

- the input on a certain time-slice to a particular feature-value on a  particular continuum is calculated by the formula:

  ```
                          n
  <ACOUSTINPUTc,f,fs> = SIGMA (<WEIGHTp(i),c,fs>
                         i=1        * <FETVALp,c,f> * <STRENGTHp(i)>)
  ```
  where  ``<ACOUSTINPUTc,f,fs>``  is  the  input  on  time-slice  ``<fs>``  to   feature-value   ``<f>``   on   continuum  ``<c>``;  ``<n>``  is  the  number  of   input-phonemes; ``<WEIGHTp(i),c,fs>`` is the scaling factor to the input   for  continuum  ``<c>`` on time-slice ``<fs>``; ``<FETVALp,c,f>`` is the ability   of the i-th input-phoneme to excite feature-value ``<f>``  on  continuum   ``<c>``; and ``<STRENGTHp(i)>`` is the strength of the i-th input-phoneme.

### THE ACTIVATION OF THE FEATURE-UNITS

The activation of a feature-unit at a certain  processing-cycle  is  a function  of its activation in the previous cycle and the net-input to the unit at that cycle.  The formula, which is  used  to  obtain  this value:

```
d<ACTc,f,fs> = (<MAX> - <ACTc,f,fs>) * <NETc,f,fs>
               - <DEC[f]> * (<ACTc,f,fs> - <REST[f]>)
                                         for <NETc,f,fs> >= 0

d<ACTc,f,fs> = (<ACTc,f,fs> - <MIN>) * <NETc,f,fs>
               - <DEC[f]> * (<ACTc,f,fs> - <REST[f]>)
                                         for <NETc,f,fs> < 0
```

where ``d<ACTc,f,fs>`` is the increase (or decrease for a negative  value) in  activation of the feature-value ``<f>`` on continuum ``<c>`` at time-slice ``<fs>``; and ``<NETc,f,fs>`` is the net-input to it; ``<MIN>``  is  the  minimum  activation  of  a  unit;  ``<MAX>``  its  maximum activation;  ``<DEC[f]>``  the  decay-value  at  the  feature  level;  and ``<REST[f]>`` the resting-level of a feature-node.  These values are fixed at a constant value.


The net-input to a feature-node at a certain processing-cycle is given by the formula:

```
<NETc,f,fs> = <EXTINPc,f,fs> + <PHONEXc,f,fs> - <FEATINc,f,fs>
```

where ``<NETc,f,fs>`` is the net-input to feature-value ``<f>``  on  continuum ``<c>``  at  time-slice  ``<fs>``;  ``<EXTINPc,f,fs>``  the external input to this unit; ``<PHONEXc,f,fs>`` the excitation to it from the phoneme-level;  and ``<FEATINc,f,fs>``  the  inhibitive  input to the unit from other units at the same continuum.


The external input to a feature-unit is given by the formula:

```
<EXTINPc,f,fs> = <FWEIGHTc> * <ACOUSTINPUTc,f,fs>
````

where ``<EXTINPc,f,fs>`` is the external input  to  feature-value  ``<f>``  on continuum  ``<c>``  at  time-slice ``<fs>``; ``<FWEIGHTc>`` is the weighting value for continuum ``<c>``; and ``<ACOUSTINPUTc,f,fs>`` is the un-weighted input to the feature-node.


To calculate the excitation to a feature-unit from the  phoneme-level, proceeding should be like this:

- For every phoneme, which is known to TRACE and for a certain  number   of   time-slices  there  exists  a  phoneme-node.   This  number  is   specified by ``<PPF>``.   To  make  clear  the  difference  between  the   duration  of  a  feature-node and a phoneme-node we use the concepts   ``<fs>`` for a time-slice at the feature-level and ``<ps>`` for a time-slice   at the phoneme-level.  The number of feature-time-slices is given by   ``<NFSLICES>``, the number of phoneme-time-slices by ``<NPSLICES>``.

- The  distance  ``<d>``  between   a   particular   time-slice   at   the   phoneme-level  and  a  particular time-slice at the feature-level is   given by the formula:
    ``  <d> = |<PPF> * <ps> - <fs>|``

- For every phoneme and every continuum a value is  calculated,  which   specifies the spread of the phoneme-excitation over time-slices:

  ``<SPREADp,c> = <WSCALEp> * <FETSPREADc>``

  where ``<SPREADp,c>`` is the spread of phoneme ``<p>`` over  continuum  ``<c>``;   ``<WSCALEp>`` is the phoneme-width's scaling-factor; and ``<FETSPREADc>`` is   the relative spread to the continuum.

- To make it possible to express the spread in time-slices the integer  value ``<INTSPREADp,c>`` is created, where
  ``<INTSPREADp,c> = int(<SPREADp,c>)``.

  N.B.The operator  'int'  will  be  used  throughout  this  paper  to   indicate rounding down to the nearest integer-value.

- We need a relative distance factor to calculate the  weight  of  the   spread  of  activation  from phoneme-nodes to feature-nodes and vice   versa.  This value has a  range  from  0  to  1,  dependent  on  the   time-slice-distance  ``<d>``  and the spread of phoneme ``<p>`` to continuum   ``<c>``, with small distances approaching 1.  It is calculated by:
  ```
      <PFRELDp,c,d> = 1 - <d> / <SPREADp,c>
                                 for 0 <= <d> < <INTSPREADp,c>

                = 0              otherwise
  ```
  where ``<PFRELDp,c,d>`` is our relative distance factor of  phoneme  ``<p>``   on  continuum  ``<c>`` for a distance ``<d>`` in time-slices of the phoneme-   node to the feature-node; ``<SPREADp,c>`` is the spread of  phoneme  ``<p>``   on continuum ``<c>``; and ``<INTSPREADp,c>`` its integer-value.

- The calculation of  the  phoneme-feature-weight,  which  scales  the   phoneme-feature excitation, according to their relative distance, is   simply:
     ``<PFWEIGHTp,c,d> = <PFRELDp,c,d>``.

- The input from a phoneme-node (a phoneme on a certain time-slice) to   a  feature-node  (a  feature-value  on  a  continuum  on  a  certain   time-slice) is given by the formula:
  ```
  <PFEXp,ps,c,f,fs> = <PFWEIGHTp,c,d> * <ACTp,ps> * <FETVALp,c,f>
  ```
  where ``<PFEXp,ps,c,f,fs>`` is the input from phoneme ``<p>`` on  time-slice   ``<ps>``  to  feature-value  ``<f>``  on  continuum  ``<c>`` on time-slice ``<fs>``;   ``<PFWEIGHTp,c,d>`` is the phoneme's and continuum's  weight-factor  for  time-slice-distance   ``<d>``;   ``<ACTp,ps>``  is  the  activation  of  the  phoneme-node; and ``<FETVALp,c,f>`` is the ability  of  phoneme  ``<p>``  to   excite  the  value  ``<f>`` on continuum ``<c>``.  The use of FETVAL insures   that only connected feature- and phoneme-nodes activate each other.

- The resulting excitation  to  a  particular  feature-node  from  all   (connected) phoneme-nodes can be calculated by:

  ```
                      n-1    p
    <PHONEXc,f,fs> = SIGMA SIGMA (<ALPHA[pf]> * <PFEXp,ps,c,f,fs>)
                     ps=0
  ```
  where ``<PHONEXc,f,fs>`` is the excitation  from  the  phoneme-level  to feature-node  ``(c,f,fs)``;  ``<n>``  is  the  number of phoneme-time-slices ``<NPSLICES>``; ``<p>`` is  the  number  of  phonemes;  ``<ALPHA[pf]>``  is  the   weighting   value   for   excitation   from   the  phoneme-  to  the   feature-level;  and  ``<PFEXp,ps,c,f,fs>``  is   the   excitation   from   phoneme-node ``(p,ps)`` to feature-node ``(c,f,fs)``.

- To calculate the total of inhibition from  the  feature-level  to  a   particular feature-node, this formula is used:
  ```
                       n
    <FEATINc,f,fs> = SIGMA (<GAMMA[f]> * <ACTc,j,fs>)     for j =/= f
                      j=1
  ```
  where ``<FEATINc,f,fs>`` = is the resulting inhibitive  input  from  the  feature  level  to  feature-node  ``(c,f,fs)``;  ``<n>``  is  the  number of   feature-values; ``<GAMMA[f]>`` is the weighting value for inhibition  at   the   feature-level;   and   ``<ACTc,j,fs>``   is   the   activation  of   feature-value ``<j>`` on continuum ``<c>`` on time-slice ``<fs>``.

### THE ACTIVATION OF THE PHONEME-UNITS

The activation of a phoneme-unit at a certain  processing-cycle  is  a function  of its activation in the previous cycle and the net-input to the unit at this cycle.  The formula to obtain the value is:

```
d<ACTp,ps> = (MAX - <ACTp,ps>) * <NETp,ps>
             - <DECAY[p]> * (<ACTp,ps> - <REST[p]>)
                                       for <NETp,ps> >= 0

d<ACTp,ps> = (<ACTp,ps> - MIN) * <NETp,ps>
             - <DECAY[p]> * (<ACTp,ps> - <REST[p]>)
                                       for <NETp,ps> < 0
```

where ``d<ACTp,ps>`` is the increase (or decrease for a negative value) in activation  of  the phoneme p at time-slice ``<ps>``; and ``<NETp,ps>`` is the
net-input to it; ``<MIN>``  is  the  minimum  activation  of  a  unit,  ``<MAX>``  its  maximum activation;  ``<DECAY[p]>``  the  decay-value  at  the  phoneme-level; and ``<REST[p]>`` the resting level of a phoneme-node.  These values are fixed at a constant value.


The net-input to a phoneme-node at a certain processing-cycle is given by the formula:

```
<NETp,ps> = <FEATEXp,ps> + <WORDEXp,ps> - <PHONINp,ps>
```

where ``<NETp,ps>`` is the net-input to  the  phoneme  ``<p>``  on  time-slice ``<ps>``,   ``<FEATEXp,ps>``   the   input   to  it  from  the  feature-level; ``<WORDEXp,ps>`` the input to it from the word-level; and ``<PHONINp,ps>`` the inhibitive  input  to  the  unit  from the other phoneme-units in this time-slice.

To calculate the input from the feature-level, the following steps are necessary:

- First a weight-factor will be obtained, which scales the input  from   a  particular  feature-unit  to  a  particular  phoneme-unit.   This   weight-factor is highly dependent on the relative  distance  between   both units.  It can be calculated by the formula:
  ```
    <FPWEIGHTc,p,d> =                         n-1               2
            <WSCALEp> * <PFRELDp,c,d> / (2 * SIGMA <PFRELDp,c,i>  + 1)
                                              i=1
  ```
  where ``<FPWEIGHTc,p,d>`` is the weight for a feature on  continuum  ``<c>``
 to  phoneme  ``<p>``  for  a  distance  ``<d>``  in  time-slices between the  feature- and the phoneme-node; ``<WSCALEp>`` is the  relative  width  of   phoneme  ``<p>``;  ``<PFRELDp,c,i>`` is the phoneme and continuum's relative   distance scaling factor for a distance ``<i>`` in time-slices;  and  ``<n>``   is the integer-value of the spread from the phoneme to the continuum   ``<INTSPREADp,c>``.  The denominator  is  the  sum  of  squares  of  all   relative distances in both directions (adding 1 for ``<d>`` = 0).

- The input from a feature-node (a feature-value on a continuum  at  a   certain  feature-time-slice)  to  a  phoneme-node  (a  phoneme  at a   certain phoneme-time-slice) is given by the formula:
  ```
    <FPEXc,f,fs,p,ps> = <FPWEIGHTc,p,d> * <ACTc,f,fs> * <FETVALp,c,f>
  ````

  where ``<FPEXc,f,fs,p,ps>`` is the excitation from feature-node ``(c,f,fs)`` to phoneme-node ``(p,s)``; ``<FPWEIGHTc,p,d>`` is the continuum-to-phoneme's  weighting factor for the time-slice-distance ``<d>``; ``<ACTc,f,fs>`` is the   activation  of the feature-node; and ``<FETVALp,c,f>`` is the ability of   phoneme p to excite feature ``(c,f)``.  Again by the use of ``FETVAL``  only   connected feature- and phoneme-nodes will excite each other.


The calculation of the excitation from the word-level to  the  phoneme level requires these steps:

- A time-slice at the word level is representated by ``<ws>``; the  number  of time-slices at the word level is equal to ``<NPSLICES>``

- For every phoneme a value is obtained, which gives its  duration  in   phoneme-time-slices.  The formula, used for this is:
  ```
    <PDURp> = int(<DURp> / <FPP>)
  ```
  where ``<PDURp>`` is  the  phoneme's  duration  in  phoneme-time-slices; ``<DURp>``  is  the phoneme's duration in feature-time-slices; and ``<FPP>`` is the number of time-slices in one phoneme-node.

- For  every  phoneme  a  value  is  calculated,   which   gives   its  half-duration in phoneme-time-slices by:
``  <HALFDURp> = int(<PDURp> / 2)``

- For every phoneme in a word-unit the peak-time-slice  is  calculated by:
  ```
  <WPEAKp(i),ws> = <ws>                                  for i = 1

                 = <WPEAKp(i-1),ws> + <HALFDURp(i-1)>
                                    + <HALFDURp(i)>      otherwise
  ```
  where ``<WPEAKp(i),ws>`` is the peak-time-slice of the i-th  phoneme  in the word-unit, starting at time-slice ``<ws>``; and ``<HALFDURp(i)>`` is the   half-duration of the i-th phoneme in phoneme-time-slices (and  since   they have the same length also in word-time-slices).

- The distance ``<dp>`` between a phoneme ``<p>`` as part  of  the  word-node, starting  at  time-slice  ``<ws>``, and phoneme-node (p,ps) is given by:  ``<dp> = |<WPEAKp,ws> - <ps>|``

- For every phoneme a value is calculated, which gives the duration of it at the word level:
```
  <WPDURp> = (<PWIDTH> + <POVERLAP>) * <WSCALEp> / <FPP>
````

  where ``<WPDURp>`` is the duration of phoneme  ``<p>``  at  the  word-level;   ``<PWIDTH>`` is the base phoneme-width in time-slices; ``<POVERLAP>`` is the   base   phoneme-overlap   in   time-slices;    ``<WSCALEp>``    is    the   phoneme-width's  scaling-factor;  and  ``<FPP>``  is the feature/phoneme   time-slice ratio.

- Again we need a relative distance scaling factor  to  calculate  the   weights of the spread of activation from word-nodes to phoneme-nodes   and vice versa.  The value has a range from 0 to 1, dependent on the   time-slice-distance ``<dp>`` and the duration of the phoneme at the word   level, with small distances approaching 1.  It can be calculated by:

  ```
  <PWRELDp,dp> = 1 - <dp> / <WPDURp>    for 0 <= <dp> < <PDURp>

               = 0                      otherwise
  ```
  where ``<PWRELDp,dp>`` is the relative distance factor  of  phoneme  ``<p>``
 for  a  distance ``<dp>`` in time-slices from the occurrence of ``<p>`` in a  word-node to the phoneme-node; ``<WPDURp>`` is the duration  of  phoneme   ``<p>``  at  the  word  level; and ``<PDURp>`` is the duration of ``<p>`` at the   phoneme level.

- Now the word-phoneme-weights can be calculated by:
  ```
                                        n-1             2
  <WPWEIGHTp,dp> = <PWRELDp,dp> / (2 * SIGMA <PWRELDp,i>  + 1)
                                        i=1
  ```
  where ``<WPWEIGHTp,dp>`` is the weight of a phoneme ``<p>`` for  a  distance ``<dp>``  from  the  occurrence  of  ``<p>``  in a word-node to phoneme-node ``<p,ps>``; ``<PWRELDp,i>``  is  the  phoneme's  relative  distance  scaling factor  for  a  distance  ``<i>`` in time-slices; and ``<n> = <PDURp>``, the duration of phoneme ``<p>`` at the phoneme-level.   The  denominator  is the  sum  of  squares of all relative distances (adding 1 for ``<dp> =  0``).

- The input from a word-node (a word at a  certain  time-slice)  to  a  phoneme-node (a phoneme at a certain time-slice) is given by:
  ```
                      o
  <WPEXw,ws,p,ps> = SIGMA (<WPWEIGHTp,dp> * <ACTw,ws>)
  ```
  where ``<WPEXw,ws,p,ps>`` is  the  input  from  word  ``<w>``,  starting  at   time-slice  ``<ws>``,  to  phoneme  ``<p>``  at  time-slice ``<ps>``; ``<o>`` is the occurrence of  phoneme  ``<p>``  in  word  ``<w>``;  ``<WPWEIGHTp,dp>``  is  the   weight-factor  of  a  phoneme  ``<p>``  for  a  distance  ``<dp>``  from the   occurrance of  ``<p>``  in  a  word-node  to  phoneme-node  ``<p,ps>``;  and   ``<ACTw,ws>`` is the activation of word-node ``(w,ws)``.   Note that with  no  occurrence  of  phoneme  ``<p>``  in  word  ``<w>``  the   excitation will be equal to 0.

- The  total  excitation  to  a  particular  phoneme-node   from   all   (connected) word-nodes is given by:
  ```
                  n-1    w
  <WORDEXp,ps> = SIGMA SIGMA (<ALPHA[wp]> * <WPEXw.ws,p,ps>)
                 ws=0
  ```
  where  ``<WORDEXp,ps>``  is  the  excitation  from  the  word  level  to phoneme-node  ``(p,ps)``;  ``<n>``  is  the  number  of  word-time-slices (= ``<NPSLICES>``); ``<w>`` is the number of words; ``<ALPHA[wp]>`` is the  weighting factor  for  excitation  from  the  word  to  the phoneme level; and ``<WPEXw,ws,p,ps>`` is the input from word-node ``(w,ws)``  to  phoneme-node ``(p,ps)``.


To calculate the inhibition from the  phoneme-level  to  a  particular phoneme-node the next steps are required:

- For every phoneme on every time-slice a value is  calculated,  which   gives the number of nodes of that particular phoneme, active on that   time-slice.  The value is obtained by the formula:
  ```
  <NPNODESp,ps> = <ps> + <HALFDURp>        for <ps> < <HALFDURp>

                  <n-ps-1> + <HALFDURp>    for <n-ps-1> < <HALFDURp>

                  2 * <HALFDURp>           otherwise
  ```
  where ``<NPNODESp,ps>`` is the number of phoneme-nodes of ``<p>`` active  on   time-slice  ``<ps>``; ``<HALFDURp>`` is the phoneme's half-duration; and ``<n>``   is the number of phoneme-time-slices ``<NPSLICES>``.

- The  total  inhibition  from  the  phoneme-level  to  a   particular   phoneme-node is given by:
  ```
                   j
  <PHONINp,ps> = SIGMA (<NPNODESj,ps> * <GAMMA[p]> * <ACTj,ps>)

                                                 for j =/= p
  ```
  where ``<PHONINp,ps>``  is  the  resulting  inhibitive  input  from  the   phoneme  level  to  phoneme-node  ``(p,ps)``;  ``<j>``  is  a  phoneme-unit;   ``<GAMMA[f]>`` is the weighting value  for  inhibition  at  the  phoneme   level;  ``<NPNODESj,ps>`` is the number of phoneme-nodes of phoneme ``<j>``,   active on time-slice ``<ps>``; and ``<ACTj,ps>`` is its activation.

### THE ACTIVATION OF THE WORD-UNITS

The activation of a word-unit  at  a  certain  processing-cycle  is  a function  of its activation in the previous cycle and the net-input to the unit at this cycle.  The formula to obtain the value is:
```
d<ACTw,ws> = (MAX - <ACTw,ws>) * <NETw,ws>
             - <DECAY[w]> + (<ACTw,ws> - <RESTw>)
                                       for <NETw,ws> >= 0

d<ACTw,ws> = (<ACTw,ws> - MIN) * <NETw,ws>
             - <DECAY[w]> + (<ACTw,ws> - <WRESTw>)
                                       for <NETw,ws> < 0
```
where d<ACTp,ps> is the increase (or decrease for a negative value) in activation  of word ``<w>`` at time-slice ``<ws>``; ``<NETw,ws>`` is the net-input to it; ``<WRESTw>`` is the resting-level of word ``<w>``. ``<MIN>``  is  the  minimum  activation  of  a  unit;  ``<MAX>``  its  maximum activation;  and  ``<DECAY[w]>`` the decay-value at the word-level.  These values are fixed at a constant value.


Unlike the other levels the resting value for a particular node at the word  level  ``<WRESTw>``  is  changable.   To every word in the lexicon a number (WFREQw) is assigned, which specifies  the  frequency  of  this particular  word.  With this value we can calculate the base value for every word by:

```
<WBASEw> = <REST[w]> + <FREQSCALE> * log(1.  + <WFREQw>)
```
where ``<WBASEw>`` is the word's base  value;  ``<REST[w]>``  is  the  resting value  of nodes at the word level; ``<FREQSCALE>`` is the word-frequency's scaling factor; and ``<WFREQw>`` is the frequency number of word ``<w>``.

It is possible for the user to prime one or more words  by  increasing its  resting  value.  The increase is given by ``<WPRIMEw>``.  The resting value of a particular word can then be calculated by:
```
<WRESTw>`` = <WBASEw> + <WPRIMEw>
````
The net-input to a phoneme-node at a certain processing-cycle is given by the formula:

```
<NETw,ws> = <PHONEXw,ws> - <WORDINw,ws>
````

where ``<NETw,ws>`` is the net-input to the word-node; ``<PHONEXw,ws>`` is the excitation  to  it  from  the  phoneme  level; and ``<WORDINw,ws>`` is the inhibitive input  to  the  unit  from  the  other  word-units  in  the time-slice.


To calculate the excitation to the word-node from the  phoneme  level, these steps are required:

- First we calculate the length of the word in phoneme-time-slices:
  ```
                 n
  <WLENGTHw> = SIGMA (2 * <HALFDURp(i)>)
                i=1
  ```
  where ``<WLENGTHw>`` is the length of word ``<w>``; ``<n>``  is  the  number  of   phonemes  in word ``<w>``; and ``<HALFDURp(i)>`` is the half-duration of the   i-th phoneme in word ``<w>``.

- Then a scaling factor is calculated, to get the length of  the  word   in phoneme-time-slices per phoneme:
  ```
  <WLPPw> = <WLENGTHw> / <n>
  ````
  where ``<WLPPw>`` is the word-length per phoneme for word ``<w>``;  and  ``<n>``   is the number of phonemes in the word.

- The  weight-factor  for  a  phoneme  and  a  certain   distance   in   time-slices will be calculated by the formula:
  ```
  <PWWEIGHTp,dp> =                         n-1             2
          <WSCALEp> * <PWRELDp,dp> / (2 * SIGMA <PWRELDp,i>  + 1)
                                           i=1
   ```
  where ``<PWWEIGHTp,dp>`` is the weight of phoneme  ``<p>``  for  a  distance   ``<dp>``  in  time-slices  from  the  occurrence  of  the phoneme in the   word-node to the  phoneme-node;  ``<WSCALEp>``  is  the  phoneme-width's   scaling-factor;  ``<PWRELDp,i>``  is  the  phoneme's  relative  distance   scaling factor for a distance ``<i>`` in time-slices; and ``<n> = <PDURp>``,   the  duration  of phoneme ``<p>`` at the phoneme level.  The denominator   is the sum of squares of all relative distances (adding 1 for ``<dp> =
  o``).

- The input from one phoneme-node (a phoneme on a certain  time-slice)   to  a  word-node  (a word on a certain time-slice) can be calculated   by:
  ```
                      o
  <PWINp,ps,w,ws> = SIGMA (<WLPPw> * <PFWEIGHTp,dp> * <ACTp,ps>)
  ```

  where ``<PWINp,ps,w,ws>`` is  the  input  from  phoneme-node  (p,ps)  to   word-node  (w,ws); ``<o>`` is the occurrence of phoneme ``<p>`` in word ``<w>``;   ``<WLPPw>`` is the word-length per phoneme of word  ``<w>``;  ``<PFWEIGHTp,dp>``   is  the  phoneme's  weight  for  a distance ``<dp>`` in time-slices; and   ``<ACTp,ps>`` is the activation of the phoneme-node.

- Finally we can calculate the phoneme  level's  total  excitation  to   word-node (w,ws) from:
  ```
                  n-1    p
  <PHONEXw,ws> = SIGMA SIGMA (<ALPHA[pw]> * <PWINp,ps,w,ws>)
                 ps=0
  ```
  where ``<PHONEXw,ws>`` is  the  excitation  from  all  phoneme-nodes  to   word-node    ``(w,ws)``;    ``<n>    =    <NPSLICES>``,    the   number   of   phoneme-time-slices; ``<p>`` is the number of phonemes;  ``<ALPHA[pw]>``  is   the  weighting  value  for  excitation  from the phoneme to the word   level; and ``<PWINp,ps,w,ws>`` is the input from phoneme-node ``(p,ps)``  to  word-node ``(w,ws)``.


The calculation of the inhibitive activity from the word  level  to  a particular word-node requires these steps:

- The  number  of  word-nodes  active  on  a  certain  time-slice   is   calculated from:
  ```
  <NWNODESw,ws> = <ws> + <HALFDURp(1)> + 1
                              for <ws> < <WLENGTH> - <HALFDURp(1)> - 1

                = <WLENGTHw> - <HALFDURp(1)>
                              for <NPSLICES> - <ws> <= <HALFDURp(1)

                = <WLENGTHw>  otherwise
  ```
  where ``<NWNODESw,ws>`` is the number of word-nodes of word ``<w>``,  active   at  time-slice  ``<ws>``;  ``<HALFDURp(1)>`` is the half-duration of the 1st   phoneme in word ``<w>``; ``<WLENGTHw>`` is the length of word ``<w>`` in phoneme   time-slices;  and  ``<NPSLICES>``  is  the  number of phoneme (and word)   time-slices.

- A value is calculated, which gives the sum of squares of activations   of all word-nodes at a certain time-slice:
  ```
                w             2
  <SSACTws> = SIGMA (<ACTw,ws> )
  ```
- The total inhibition to a word-node from all other word-nodes at the   same  time-slice is dependent on the height of the sum of squares of   activations, compared to the maximum inhibition value for word-nodes   ``<WIMAX>``.
  ```
     When ``<SSACTws> <= <WIMAX>``:
                      j                                          2
     <WORDINw,ws> = SIGMA (<NWNODESj,ws> * <GAMMA[w]> * <ACTj,ws> )

                                                 for j =/= w
     Otherwise:
                      j
     <WORDINw,ws> = SIGMA (<NWNODESj,ws>                          2
                               * <GAMMA[w]> * (<WIMAX> - <ACTw,ws> )
  ```
  where ``<WORDINw,ws>`` is the inhibition from the  word  level  to  word   node (w,ws); ``<j>`` is the number of words; ``<GAMMA[w]>`` is the weighting   value for inhibition at the word level; ``<NWNODESj,ws>`` is the  number   of  word-nodes  of  ``<j>``, active at time-slice ``<ws>``; and ``<ACTj,ws>`` is   the activation of word-node ''(j,ws)''.

### DEFAULT VALUES

Default values are used for almost all variables in the TRACE-program. The  user  is able to modify many of them in the command-mode.  Others can be changed relatively easy in the  program  itself.   The  default values, used in the TRACE-program, are:

The number of phoneme time-slices ``<NPSLICES>`` is set to 33; as a result there  are  also 33 word time-slices.  The feature/phoneme ratio ``<FPP>`` has a value of 3 features per phoneme.   This  brings  the  number  of (feature) time-slices to 99.

The minimum ``<MIN>`` and maximum  ``<MAX>``  values  for   unit activations  in  the program  are  -.30  and 1.00 respectively.  The resting values for the separate levels of representation are:
  ```
    <REST[f]> = -.10
    <REST[p]> = -.10
    <REST[w]> = -.01
  ```
The decay rates, used in TRACE (according to the 1986 article):

  ```
    <DECAY[f]> = .01
    <DECAY[p]> = .03
    <DECAY[w]> = .05
  ```

The between level excitation values, used in TRACE (also in  the  1986 article):
  ```
    <ALPHA[fp]> = .02
    <ALPHA[pw]> = .05
    <ALPHA[wp]> = .03
    <ALPHA[pf]> = .00
  ```
Note, that since the phoneme-feature weight is set to 0, there will be no  excitation  from  the  phoneme  level  to the feature nodes (for a discussion of this fact, see the article).

The within level inhibition values (again from the 1986 article):
  ```
     <GAMMA[f]> = .04
     <GAMMA[p]> = .04
     <GAMMA[w]> = .03
  ```

The feature level consists of 7 continuums,  each  of  them  having  9 values  (highest  0  to  lowest 8).  We can derive from this, that the number of feature-nodes is 63 per time-slice, giving an amount of 6227 feature-nodes  in  the whole program.  For each continuum the relative spread is  given  by  ``<FETSPREADc>``;  the  continuum-names  with  their relative spread values are:

- POWER = 3
- VOCALIC = 6
- DIFFUSE = 6
- ACUTE = 9
- GRADUAL = 9
- VOICED = 3
- BURST = 3

The ``<FWEIGHTc>`` values, which scale the feature-phoneme excitation, are the same for all continuums:  1.00

There are **15 phonemes** known to TRACE:  "pbtdkgsSrlaiu^-" (where "-" is the  silence-phoneme).   So  over 33 phoneme time-slices there are 495 phoneme-nodes.

Besides that there are **8 phoneme-classes** known to TRACE:  

- vocalic (V)
- consonantal (C)
- liquid (L)
- noncompact (N)
- dental stop (D)
- velar stop (G)
- bilabial stop (B)
- bil/alv (T)

These values  are only used for input to the feature-nodes.


The feature-values (FETVAL) used in  TRACE  for  each  value  on  each continuum for each phoneme are:

|Phone|  POW   |  VOC  |   DIF   |  ACU   |   GRD   |  VOI   |  BUR   |
|-----|--------|-------|---------|--------|---------|--------|--------|
|p    | 4(1.0) | 7(1.0)| 1(1.0)  | 6(1.0) | 7(1.0)  | 7(1.0) | 0(1.0) |
|     |        |       |         |        |         |        |1(0.2)  |
|b    | 4(1.0) | 7(1.0)| 1(1.0)  | 6(1.0) | 7(1.0)  | 1(1.0) | 0(0.2) |
|     |        |       |         |        |         |        | 1(1.0) |
|t    | 4(1.0) | 7(1.0)| 1(1.0)  | 1(1.0) | 7(1.0)  | 7(1.0) | 2(1.0) |
|     |        |       |         |        |         |        | 3(0.2) |
|d    | 4(1.0) | 7(1.0)|  1(1.0) | 1(1.0) | 7(1.0)  | 1(1.0) | 2(0.2) |
|     |        |       |         |        |         |        | 3(1.0) |
|k    | 4(1.0) | 7(1.0)|  6(1.0) | 3(0.1) | 7(1.0)  | 7(1.0) | 4(1.0) |
|     |        |       |       |  4(0.3)  |         |        | 5(0.2) |
|     |        |       |       |  5(1.0)  |         |        |        |
|     |        |       |       |  6(0.3)  |         |        |        |
|     |        |       |       |  7(0.1)  |         |        |        |
|g    | 4(1.0) | 7(1.0)|  6(1.0) | 3(0.1) | 7(1.0)  | 1(1.0) |  4(0.2)|
|     |        |       |       |  4(0.3)  |         |        | 5(1.0) |
|     |        |       |       |  5(1.0)  |         |        |        |
|     |        |       |       |  6(0.3)  |         |        |        |
|     |        |       |       |  7(0.1)  |         |        |        |
|s    | 2(1.0) | 4(1.0)|1(1.0) | 0(1.0)   | 3(1.0)  | 7(1.0) |        |
|     |        |       |       |  1(0.3)  |         |        |        |
|     |        |       |       |  2(0.1)  |         |        |        |
|S    | 2(1.0) | 4(1.0)|2(1.0) | 2(0.1)   | 3(1.0)  | 7(1.0) |        |
|     |        |       |       |  3(0.3)  |         |        |        |
|     |        |       |       |  4(1.0)  |         |        |        |
|     |        |       |       |  5(0.3)  |         |        |        |
|     |        |       |       |  6(0.1)  |         |        |        |
|r    | 1(1.0) | 1(1.0)|6(0.5) | 6(1.0)   | 4(1.0)  | 0(1.0) |        |
|     |        |       |7(1.0) |          |         |        |        |
|l    | 1(1.0) | 1(1.0)|6(1.0) | 4(1.0)   | 4(1.0)  | 0(1.0) |        |
|     |        |       |7(0.5) |          |         |        |        |
|a    | 0(1.0) | 0(1.0)|6(1.0) | 5(0.1)   |  1(1.0) |  0(1.0)|        |
|     |        |       |       |6(0.3)    |         |        |        |
|     |        |       |       |7(1.0)    |         |        |        |
|i    | 0(1.0) | 0(1.0)|0(1.0) | 0(1.0)   | 1(1.0)  | 0(1.0) |        |
|     |        |       |       |1(0.3)    |         |        |        |
|     |        |       |       |2(0.1)    |         |        |        |
|u    | 0(1.0) | 0(1.0)|2(1.0) | 4(0.1)   | 1(1.0)  | 0(1.0) |        |
|     |        |       |       |5(0.3)    |         |        |        |
|     |        |       |       |6(1.0)    |         |        |        |
|     |        |       |       |7(0.3)    |         |        |        |
|     | 1(1.0) | 0(1.0)|3(1.0) | 5(0.1)   | 1(1.0)  | 0(1.0) |        |
|     |        |       |       |6(0.3)    |         |        |        |
|     |        |       |       |7(1.0)    |         |        |        |
|-    | 8(1.0) | 8(1.0)|8(1.0) | 8(1.0)   |  8(1.0) | 8(1.0) | 8(1.0) |

The  feature-values  for  each  value  on  each  continuum  for   each
phoneme-class are:

|Class|  POW   |  VOC  |  DIF  |  ACU  |  GRD  | VOI  | BUR  |
|-----|--------|-------|-------|-------|-------|------|------|
|V    | 0(1.0) | 0(1.0)|       |       |       |0(1.0)|      |
|C    | 4(1.0) | 4(1.0)|       |       |       |      |      |
|L    | 1(1.0) | 1(1.0)| 6(0.5)|4(0.5) | 4(1.0)|0(1.0)|      |
|     |        |       | 7(0.5)| 6(0.5)|       |      |      |
|N    |        |       | 0(1.0)|       |       |      |      |
|D    | 4(1.0) |7(1.0) | 1(1.0)|1(1.0) | 7(1.0)|      |2(0.5)|
|     |        |       |       |       |       |      |3(0.5)|
|G    | 4(1.0) | 7(1.0)|6(1.0) |5(1.0) | 7(1.0)|      |4(0.5)|
|     |        |       |       |       |       |      |5(0.5)|
|B    | 4(1.0) |7(1.0) |1(1.0) |6(1.0) |7(1.0) |      |0(0.5)|
|     |        |       |       |       |       |      |1(0.5)|
|T    | 4(1.0) |7(1.0) |1(1.0) |3(0.5) |7(1.0) |7(1.0)|0(1.0)|
|     |        |       |       |4(0.5) |       |      |2(1.0)|

The susceptibility ``<SUSp>`` is set to 1.00 for all phonemes.

The relative width of each phoneme ``<WSCALEp>`` is 1.00 for all phonemes. This means, that in TRACE no phoneme variability exists!  (It is still possible for the user to variate the rate of the  input-phonemes,  but this will only have an effect on the input to the feature-nodes).

The base phoneme-width in time-slices ``<PWIDTH>`` is 6.  So we can derive the  intrinsic  duration  ``<DURp>`` of each phoneme.  This value is 6 for all phonemes; we can also calculate the intrinsic duration in  phoneme time-slices  ``<PDURp>``,  which  turns  out  to  be  2  for all phonemes. Finally the half-duration ``<HALFDURp>`` is 1 for all phonemes.

The base phoneme-overlap in  time-slices  ``<POVERLAP>``  is  6.   We  can calculate  from  this  the phoneme durations at the word level to be 4 for all phonemes.

The maximum inhibitive activity for all word-nodes ``<WIMAX>`` is  set  to 3.0

The scaling factor for word-frequency  ``<FREQSCALE>``  is  set  to  0  by default; so there will be no word-frequency effects, unless this value is changed by the user.

Values, which have no default, but always must  be  specified  by  the user are:

- the input-phonemes, and their values for
    -rate: ``<RATEp(i)>``
    - and  strength-values ``<STRENGTHp(i)>`` (specified in the input-file);
- the words, known to the program (specifiable as an external lexicon file), and each word's frequency  number  ``<WFREQw>`` (specified in the lexicon-file).


On every processing cycle ``<cy>`` the feature-layer nodes ``(c,f,fs)`` of TRACE get the  input,  specified in ``<ACOUSTINPUTc,f,fs>``, where by default ``<fs>`` = ``<cy>``.

Then the activation values  of  all  nodes  in  TRACE  will  be updated.   As we have seen all inhibition within levels is only within the same time-slice.  On the contrary the  excitation  between  levels can spread over time-slices; this makes the activation of nodes with a higher value in time-slices than ``<cy>``, possible.  Updating will go on, even after TRACE has run out of input, as long as ``<cy>`` < ``<NFSLICES>``.

----------
<center>

# END

</center>

----------
