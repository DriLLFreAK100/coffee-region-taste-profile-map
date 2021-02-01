import coffeeDistributor2019 from '../assets/coffee-distributor-2019.json';
import geoJson from '../assets/world.json';
import { SVGProps } from 'react';

export interface ICoffeeDistributor {
  Rank: string;
  Country: string;
  Bags: string;
  MetricTons: string;
  Pounds: string;
}

export interface ITasteProfile {
  summary: string;
}

export interface IMapCountry {
  coffeeRegionName: string;
  countryName: string;
  continent: string;
  isCoffeeRegion: boolean;
  regionUn: string;
  regionWb: string;
  subRegion: string;
  tasteProfile: ITasteProfile;
  svg: SVGProps<SVGPathElement>;
}

const defaultColor = '#ddd'
const africaColor = '#d3a564'
const africaColorAlt = '#ffd693';
const americaColor = '#af855f';
const americaColorAlt = '#e2b58d';
const asiaColor = '#563625';
const asiaColorAlt = '#84604d';
const exceptionCountryNames: { [key: string]: string } = {
  'Tanzania': 'United Republic of Tanzania',
  'Timor Leste': 'East Timor',
}

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
      coffeeRegionName: getCoffeeRegionName(feature.properties.REGION_UN),
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

const getCoffeeRegionName = (region: string) => {
  if (region.includes('America')) {
    return 'Latin America';
  } else if (region.includes('Africa')) {
    return 'Africa';
  } else if (region.includes('Asia')) {
    return 'Asia';
  }
  return null;
};

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
      summary: 'Chocolate, Nutty, Caramel'
    };
  } else if (region.includes('Africa')) {
    return {
      summary: 'Fruity, Floral, Sweet'
    };
  } else if (region.includes('Asia')) {
    return {
      summary: 'Dark Chocolate, Earthy, Herbal, Spice'
    };
  }
  return null;
};

const isMatchCoffeeRegion = (source: IMapCountry, target: IMapCountry) => {
  return source.isCoffeeRegion
    && target.isCoffeeRegion
    && source.regionUn === target.regionUn;
}

const useCoffeeData = () => {
  return {
    constructContries,
    getCoffeeRegionName,
    getRegionColor,
    getRegionHoverColor,
    getRegionTasteProfile,
    isMatchCoffeeRegion,
  };
}

export default useCoffeeData;
