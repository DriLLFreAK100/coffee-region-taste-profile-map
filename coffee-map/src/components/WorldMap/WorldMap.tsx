import * as d3 from 'd3';
import coffeeDistributor2019 from '../../assets/coffee-distributor-2019.json';
import geoJson from '../../assets/world.json';
import React, { SVGProps, useEffect, useState } from 'react';
import './WorldMap.css';

interface ICoffeeDistributor {
  Rank: string;
  Country: string;
  Bags: string;
  MetricTons: string;
  Pounds: string;
}

interface ITasteProfile {
  summary: string;
}

interface IMapCountry {
  countryName: string;
  continent: string;
  isCoffeeRegion: boolean;
  regionUn: string;
  regionWb: string;
  subRegion: string;
  tasteProfile: ITasteProfile;
  svg: SVGProps<SVGPathElement>;
}

const exceptionCountryNames: { [key: string]: string } = {
  'Tanzania': 'United Republic of Tanzania',
  'Timor Leste': 'East Timor',
}

const defaultColor = '#ddd'
const africaColor = '#d3a564'
const africaColorAlt = '#ffd693';
const americaColor = '#af855f';
const americaColorAlt = '#e2b58d';
const asiaColor = '#563625';
const asiaColorAlt = '#84604d';

const constructContries = (geoPathGenerator: d3.GeoPath<any, d3.GeoPermissibleObjects>) => {
  const coffeeDistributorDict: { [key: string]: ICoffeeDistributor } =
    coffeeDistributor2019.reduce((a, c: ICoffeeDistributor) => {
      return {
        ...a,
        [exceptionCountryNames[c.Country] ?? c.Country]: c,
      };
    }, {});

  const countries = geoJson.features.map((feature) => {
    let svgProps: SVGProps<SVGPathElement> = {
      d: geoPathGenerator(feature as any) || '',
      stroke: defaultColor,
      fill: defaultColor,
    }

    let isCoffeeRegion = false;

    if (coffeeDistributorDict[feature.properties.ADMIN]) {
      isCoffeeRegion = true;

      svgProps = {
        ...svgProps,
        stroke: getRegionColor(feature.properties.REGION_UN),
        fill: getRegionColor(feature.properties.REGION_UN),
      }
    }

    return {
      continent: feature.properties.CONTINENT,
      countryName: feature.properties.ADMIN,
      isCoffeeRegion,
      regionUn: feature.properties.REGION_UN,
      regionWb: feature.properties.REGION_WB,
      subRegion: feature.properties.SUBREGION,
      tasteProfile: getRegionTasteProfile(feature.properties.REGION_UN),
      svg: svgProps,
    } as IMapCountry;
  });

  return countries;
}

const getRegionColor = (region: string) => {
  if (region.includes('America')) {
    return americaColor;
  } else if (region.includes('Africa')) {
    return africaColor;
  } else if (region.includes('Asia')) {
    return asiaColor;
  }
  return defaultColor;
};

const getRegionHoverColor = (region: string) => {
  if (region.includes('America')) {
    return americaColorAlt;
  } else if (region.includes('Africa')) {
    return africaColorAlt;
  } else if (region.includes('Asia')) {
    return asiaColorAlt;
  }
  return defaultColor;
};

const getRegionTasteProfile = (region: string): ITasteProfile | null => {
  if (region.includes('America')) {
    return {
      summary: 'Nutty, Chocolate'
    };
  } else if (region.includes('Africa')) {
    return {
      summary: 'Fruity, Floral'
    };
  } else if (region.includes('Asia')) {
    return {
      summary: 'Earthy, Spice, Dark Chocolate'
    };
  }
  return null;
};

const isMatchCoffeeRegion = (source: IMapCountry, target: IMapCountry) => {
  return source.isCoffeeRegion
    && target.isCoffeeRegion
    && source.regionUn === target.regionUn;
}

const WorldMap = () => {
  const [mapCountries, setMapCountries] = useState<IMapCountry[]>([]);

  const handleMouseOverCountry = (country: IMapCountry) => {
    const updatedCountries = mapCountries
      .map(m => {
        if (isMatchCoffeeRegion(m, country)) {
          return {
            ...m,
            svg: {
              ...m.svg,
              stroke: getRegionHoverColor(country.regionUn),
              fill: getRegionHoverColor(country.regionUn),
            }
          }
        }

        return m;
      });

    setMapCountries(updatedCountries)
  };

  const handleMouseLeaveCountry = (country: IMapCountry) => {
    const updatedCountries = mapCountries
      .map(m => {
        if (isMatchCoffeeRegion(m, country)) {
          return {
            ...m,
            svg: {
              ...m.svg,
              stroke: getRegionColor(country.regionUn),
              fill: getRegionColor(country.regionUn),
            }
          }
        }

        return m;
      });

    setMapCountries(updatedCountries)
  };

  useEffect(() => {
    const projection = d3
      .geoEquirectangular()
      .fitSize([800, 400], geoJson as any);

    const geoPathGenerator = d3.geoPath().projection(projection);
    const countries = constructContries(geoPathGenerator);

    setMapCountries(countries);
  }, []);

  return (
    <div className="WorldMap">
      <svg
        className="WorldMap--svg"
        width="800"
        height="400"
      >
        {mapCountries.map(country => {
          return (
            <path
              id={country.countryName}
              key={country.countryName}
              {...country.svg as any}
              onMouseOver={() => handleMouseOverCountry(country)}
              onMouseLeave={() => handleMouseLeaveCountry(country)}
            >
              {
                country.tasteProfile ?
                  <title>{country.tasteProfile.summary}</title> : null
              }
            </path>
          )
        })}
      </svg>
    </div>
  );
};

export default WorldMap;
