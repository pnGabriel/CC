import matplotlib.pyplot as plt
import requests
import threading
import concurrent.futures
import time

#url = 'http://127.0.0.1:4000/api/random'
url = 'http://127.0.0.1:4000/api/random/v2'

batches = 10
concurent_nr = 10
status = [[] for _ in range(batches)]
elapsed = [[] for _ in range(batches)]


def make_plot(v_status, v_elapsed, save=True):
    s = []
    for el in v_status:
        s += el
    s = [1 if el == 200 else 0 for el in s]
    e = []
    for el in v_elapsed:
        e += el
    nrs = [_ for _ in range(batches * concurent_nr)]
    plt.plot(nrs, e, label='latency')
    plt.plot(nrs, s, label='success')
    plt.xlabel('request_nr')
    plt.ylabel('value')
    plt.title('Metrics')
    plt.legend()
    if save:
        plt.savefig("plots/{}.png".format(time.strftime("%H_%M_%m_%d", time.localtime())))
    plt.show()


def make_request(batch_nr):
    print("[{}]".format(batch_nr))
    response = requests.request('GET', url)
    print('R: {}'.format(response))
    return response


def main():
    for batch_nr in range(batches):
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurent_nr) as executor:
            # executor.map(make_request, [batch_nr for _ in range(concurent_nr)])
            future_to_req = {executor.submit(make_request, batch_nr): batch_nr for _ in range(concurent_nr)}
            for future in concurrent.futures.as_completed(future_to_req):
                b_nr = future_to_req[future]
                try:
                    data = future.result()
                    response = data
                except Exception as e:
                    print(e)
                else:
                    status[batch_nr].append(response.status_code)
                    elapsed[batch_nr].append(response.elapsed.total_seconds())
        print("FINISJED {}".format(batch_nr))
    print(status)
    print(elapsed)
    make_plot(status, elapsed, save=True)


if __name__ == '__main__':
    main()
