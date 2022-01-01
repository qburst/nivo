import { arc as d3Arc } from 'd3-shape'
import { chord as d3Chord, ChordLayout, ribbon as d3Ribbon } from 'd3-chord'
import { ArcDatum, ChordCommonProps, ChordDataProps } from './types'
import { OrdinalColorScale } from '@nivo/colors'

export const computeChordLayout = ({ padAngle }: { padAngle: ChordCommonProps['padAngle'] }) =>
    d3Chord().padAngle(padAngle)

export const computeChordGenerators = ({
    width,
    height,
    innerRadiusRatio,
    innerRadiusOffset,
}: {
    width: number
    height: number
    innerRadiusRatio: ChordCommonProps['innerRadiusRatio']
    innerRadiusOffset: ChordCommonProps['innerRadiusOffset']
}) => {
    const center = [width / 2, height / 2]
    const radius = Math.min(width, height) / 2
    const innerRadius = radius * innerRadiusRatio
    const ribbonRadius = radius * (innerRadiusRatio - innerRadiusOffset)

    const arcGenerator = d3Arc().outerRadius(radius).innerRadius(innerRadius)

    const ribbonGenerator = d3Ribbon().radius(ribbonRadius)

    return { center, radius, innerRadius, arcGenerator, ribbonGenerator }
}

export const computeChordArcsAndRibbons = ({
    chord,
    data,
    keys,
    getLabel,
    formatValue,
    getColor,
}: {
    chord: ChordLayout
    data: ChordDataProps['data']
    keys: ChordDataProps['keys']
    getLabel: (arc: ArcDatum) => string
    formatValue: (valuee: number) => string
    getColor: OrdinalColorScale<any>
}) => {
    const ribbons = chord(data)

    const arcs = ribbons.groups.map(arc => {
        arc.id = keys[arc.index]
        arc.color = getColor(arc)
        arc.formattedValue = formatValue(arc.value)
        arc.label = getLabel(arc)

        return arc
    })

    ribbons.forEach(ribbon => {
        ribbon.source.id = keys[ribbon.source.index]
        ribbon.source.color = getColor(ribbon.source)
        ribbon.source.formattedValue = formatValue(ribbon.source.value)
        ribbon.source.label = getLabel(ribbon.source)

        ribbon.target.id = keys[ribbon.target.index]
        ribbon.target.color = getColor(ribbon.target)
        ribbon.target.formattedValue = formatValue(ribbon.target.value)
        ribbon.target.label = getLabel(ribbon.target)

        // ensure id remains the same even if source/target are reversed
        ribbon.id = [ribbon.source.id, ribbon.target.id].sort().join('.')
    })

    return { arcs, ribbons }
}