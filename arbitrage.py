#!/usr/bin/env python3

def moneyLineToDecimal(x):
    if (x < 0):
        return (x-100)/x
    else:
        return (x+100)/100

def isArbitrage(x, y, bet):
    decx = moneyLineToDecimal(x)
    decy = moneyLineToDecimal(y)
    if ((1/decx) + (1/decy) >= 1):
        print("Not arbitrage")
    else:
        unbiasedX = bet/((decx/decy)+1)
        unbiasedY = bet/((decy/decx)+1)
        biasedX = bet/decy
        biasedY = bet/decx
        print("Unbiased bet:")
        print("Bet $" + str(unbiasedX) + " at " + str(x))
        print("Bet $" + str(unbiasedY) + " at " + str(y))
        print("Profit is $" + str((unbiasedX*decx) - bet))
        print("\nBiased bet at " + str(x) + ":")
        print("Bet $" + str(bet-biasedX) + " at " + str(x))
        print("Bet $" + str(biasedX) + " at " + str(y))
        print("Profit can be a maximum of $" + str(((bet-biasedX)*decx) - bet))
        print("\nBiased bet at " + str(y) + ":")
        print("Bet $" + str(biasedY) + " at " + str(x))
        print("Bet $" + str(bet-biasedY) + " at " + str(y))
        print("Profit can be a maximum of $" + str(((bet-biasedY)*decy) - bet))


def main():
    isArbitrage(205, -175, 100)

if __name__ == "__main__":
    main()