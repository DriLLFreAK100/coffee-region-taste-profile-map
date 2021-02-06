import Tooltip from '../Tooltip';
import useCoffeeData, { IMapCountry } from '../../hooks/useCoffeeData';
import { useWindowSize } from 'codefee-kit';
import './WorldMap.scss';
import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const WorldMap = () => {
  const tooltip = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState<ReactNode>(null);
  const [mapCountries, setMapCountries] = useState<IMapCountry[]>([]);
  const { width, height } = useWindowSize();
  const {
    constructContries,
    isMatchCoffeeRegion,
    getRegionColor,
    getRegionHoverColor
  } = useCoffeeData();

  const mapSize: [number, number] = useMemo(() => {
    return [
      (width) || 0,
      (height) || 0
    ];
  }, [height, width])

  const handleMouseOverCountry = (evt: React.MouseEvent<SVGPathElement, MouseEvent>, country: IMapCountry) => {
    if (country.isCoffeeRegion && tooltip?.current) {
      tooltip.current.style.display = "block";
      tooltip.current.style.left = evt.pageX + 10 + 'px';
      tooltip.current.style.top = evt.pageY + 10 + 'px';
      setTooltipContent(renderTooltipContent(country));
    }

    setMapCountries(mapCountries
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
      }));
  };

  const handleMouseLeaveCountry = (country: IMapCountry) => {
    if (tooltip?.current) {
      tooltip.current.style.display = "none";
    }

    setMapCountries(mapCountries
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
      }));
  };

  const renderTooltipContent = (country: IMapCountry): ReactNode => {
    return (
      <div className="WorldMap--tooltip">
        <div className="WorldMap--tooltip--title">
          {country.coffeeRegionName}
        </div>
        <hr />
        <p className="WorldMap--tooltip--content">
          {country?.tasteProfile?.summary}
        </p>
      </div>
    );
  };

  useEffect(() => {
    const initialMapCountries = constructContries(mapSize);
    setMapCountries(initialMapCountries);
  }, [constructContries, mapSize]);

  return (
    <div className="WorldMap">
      <div ref={tooltip} style={{ position: 'absolute', display: 'none' }}>
        <Tooltip>
          {tooltipContent}
        </Tooltip>
      </div>

      <svg
        className="WorldMap--svg"
        width={mapSize[0]}
        height={mapSize[1]}
      >
        {mapCountries.map(country => {
          return (
            <path
              id={country.countryName}
              key={country.countryName}
              {...country.svg as any}
              onMouseMove={(e) => handleMouseOverCountry(e, country)}
              onMouseLeave={() => handleMouseLeaveCountry(country)}
            />
          )
        })}
      </svg>
    </div>
  );
};

export default WorldMap;
