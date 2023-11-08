"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import styles from "./suika.module.scss";

const Suika = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Events = Matter.Events;
    const Runner = Matter.Runner;
    const Composite = Matter.Composite;

    // Matter.js 엔진 생성
    const engine = Engine.create();
    // runner create
    const runner = Runner.create();
    // 렌더러 생성
    const render = Render.create({
      canvas: canvasRef.current as HTMLCanvasElement,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });

    const watermelons: Matter.Body[] = [];
    const lemons: Matter.Body[] = [];
    const podos: Matter.Body[] = [];

    // 게임 월드 생성
    const world = engine.world;

    // 게임 벽 객체 생성
    const wallLeft = Bodies.rectangle(0, 0, 6, window.innerHeight * 2, {
      isStatic: true,
      label: "wallLeft",
    });
    const wallRight = Bodies.rectangle(
      window.innerWidth * 2 - 30,
      0,
      666,
      window.innerHeight * 2,
      { isStatic: true, label: "wallRight" },
    );
    const wallBottom = Bodies.rectangle(
      0,
      window.innerHeight,
      window.innerWidth * 2,
      50,
      { isStatic: true, label: "wallBottom" },
    );

    const addWatermelon = (x: number, y: number) => {
      const watermelon = Bodies.circle(x, y, 10, {
        restitution: 0.1,
        label: "watermelon" + watermelons.length,
        render: {
          sprite: {
            texture:
              "https://velog.velcdn.com/images%2Fseungjae2668%2Fpost%2Fedfd8b55-7cde-42f6-9d9d-0ed50fd1a3e3%2Fimage.png",
            xScale: 0.5,
            yScale: 0.5,
          },
        },
      });
      World.add(world, watermelon);
      watermelons.push(watermelon);
    };

    canvasRef.current?.addEventListener("click", (e) => {
      const bound = canvasRef.current?.getBoundingClientRect();
      const mouseX = e.clientX - (bound?.left || 0);
      const mouseY = e.clientY - (bound?.top || 0);

      addWatermelon(mouseX, mouseY);
    });

    const convertToLemon = (watermelons: Matter.Body[]) => {
      if (watermelons.length >= 2) {
        const s1 = watermelons.indexOf(watermelons[0]);
        const s2 = watermelons.indexOf(watermelons[1]);
        // 두 수박의 위치를 가져옵니다.
        const positionA = watermelons[s1].position;
        const positionB = watermelons[s2].position;

        // 두 수박 사이의 중간 지점을 계산합니다.
        const centerX = (positionA.x + positionB.x) / 2;
        const centerY = (positionA.y + positionB.y) / 2;

        // 중간 지점에 레몬을 생성합니다.
        const lemon = Bodies.circle(centerX, centerY, 25, {
          restitution: 0.3,
          label: "lemon" + lemons.length,
          render: {
            sprite: {
              texture:
                "https://velog.velcdn.com/images%2Fseungjae2668%2Fpost%2Fedfd8b55-7cde-42f6-9d9d-0ed50fd1a3e3%2Fimage.png",
              xScale: 0.5,
              yScale: 0.5,
            },
          },
        });

        // 두 수박을 제거합니다.
        Composite.remove(world, [watermelons[0], watermelons[1]]);

        // 레몬을 월드에 추가합니다.
        World.add(world, lemon);

        // 레몬 배열에 추가합니다.
        lemons.push(lemon);
      }
    };

    const convertToPodo = (lemons: Matter.Body[]) => {
      if (lemons.length >= 2) {
        const s1 = lemons.indexOf(lemons[0]);
        const s2 = lemons.indexOf(lemons[1]);
        // 두 수박의 위치를 가져옵니다.
        const positionA = lemons[s1].position;
        const positionB = lemons[s2].position;

        // 두 수박 사이의 중간 지점을 계산합니다.
        const centerX = (positionA.x + positionB.x) / 2;
        const centerY = (positionA.y + positionB.y) / 2;

        // 중간 지점에 레몬을 생성합니다.
        const podo = Bodies.circle(centerX, centerY, 60, {
          restitution: 0.6,
          label: "podo" + podos.length,
          render: {
            sprite: {
              texture:
                "https://velog.velcdn.com/images%2Fseungjae2668%2Fpost%2Fedfd8b55-7cde-42f6-9d9d-0ed50fd1a3e3%2Fimage.png",
              xScale: 0.5,
              yScale: 0.5,
            },
          },
        });

        // 두 수박을 제거합니다.
        Composite.remove(world, [lemons[0], lemons[1]]);

        // 레몬을 월드에 추가합니다.
        World.add(world, podo);

        // 레몬 배열에 추가합니다.
        podos.push(podo);
      }
    };

    Events.on(engine, "collisionStart", (event) => {
      const collidingWatermelons: Matter.Body[] = [];
      const collidingLemons: Matter.Body[] = [];
      event.pairs.forEach((pair) => {
        console.log(pair.bodyA.label, pair.bodyB.label);
        if (
          watermelons.includes(pair.bodyA) &&
          watermelons.includes(pair.bodyB)
        ) {
          collidingWatermelons.push(pair.bodyA, pair.bodyB);
        } else if (lemons.includes(pair.bodyA) && lemons.includes(pair.bodyB)) {
          collidingLemons.push(pair.bodyA, pair.bodyB);
        }
      });
      if (collidingWatermelons.length >= 2) {
        // 두 개의 레몬이 충돌했을 때 포도으로 변경
        convertToLemon(collidingWatermelons);
      } else if (collidingLemons.length >= 2) {
        convertToPodo(collidingLemons);
      }
    });

    // 월드에 객체 추가
    World.add(world, [wallLeft, wallRight, wallBottom]);
    // runner
    Runner.run(runner, engine);
    // 렌더러 실행
    Render.run(render);
  }, []);

  return <canvas className={styles["suika"]} ref={canvasRef} />;
};

export default Suika;
