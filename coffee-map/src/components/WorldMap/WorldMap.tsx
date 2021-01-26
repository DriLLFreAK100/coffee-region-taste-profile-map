import * as d3 from 'd3';
import geoJson from '../../assets/world.json';
import React, { useEffect, useState } from 'react';
import './WorldMap.css';

interface IMapCountry {
  svgPath: string;
  countryName: string;
}

const WorldMap = () => {
  const [mapCountries, setMapCountries] = useState<IMapCountry[]>([]);

  useEffect(() => {
    const projection = d3
      .geoEquirectangular()
      .fitSize([800, 400], geoJson as any);

    const geoPathGenerator = d3.geoPath().projection(projection);

    const country = geoJson.features.map((feature) => {
      return {
        svgPath: geoPathGenerator(feature as any),
        countryName: feature.properties.ADMIN,
      } as IMapCountry;
    });

    setMapCountries(country);
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
            <path className="WorldMap--svg--path"
              id={country.countryName}
              key={country.countryName}
              d={country.svgPath}
            />
          )
        })}
      </svg>
    </div>
  );
};

export default WorldMap;
